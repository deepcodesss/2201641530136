import express from "express";
import crypto from "crypto";
import ShortUrl from "./models/shorturl.js";
import { isValidUrl, isValidShortcode, minutesToExpiry } from "./utils/validate.js";
import { generateCode } from "./services/codegen.js";

const router = express.Router();

// POST /shorturls  -> create
router.post("/shorturls", async (req, res, next) => {
  try {
    const { url, validity, shortcode } = req.body || {};

    if (!url || !isValidUrl(url)) {
      const e = new Error("Invalid 'url'. Must be a valid http(s) URL.");
      e.statusCode = 400; e.expose = true; throw e;
    }

    const minutes = minutesToExpiry(validity) ?? Number(process.env.DEFAULT_VALIDITY_MIN || 30);
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    let code = shortcode ? String(shortcode) : generateCode(6);
    if (shortcode && !isValidShortcode(shortcode)) {
      const e = new Error("Invalid 'shortcode'. Use 4-32 chars: A-Z a-z 0-9 _ -");
      e.statusCode = 400; e.expose = true; throw e;
    }

    // ensure unique; if collision, regenerate a few times
    let tries = 0;
    while (tries < 5) {
      try {
        const doc = await ShortUrl.create({ code, url, expiresAt });
        const shortLink = `${process.env.BASE_URL}/${doc.code}`;
        return res.status(201).json({ shortLink, expiry: doc.expiresAt.toISOString() });
      } catch (err) {
        if (err.code === 11000) { // duplicate key
          if (shortcode) {
            const e = new Error("Shortcode already taken.");
            e.statusCode = 409; e.expose = true; throw e;
          }
          code = generateCode(6); // auto-regenerate
          tries++;
          continue;
        }
        throw err;
      }
    }

    const e = new Error("Could not allocate a unique shortcode. Try again.");
    e.statusCode = 503; e.expose = true; throw e;
  } catch (err) {
    next(err);
  }
});

// GET /shorturls/:code  -> stats
router.get("/shorturls/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const doc = await ShortUrl.findOne({ code }).lean();
    if (!doc) {
      const e = new Error("Shortcode not found.");
      e.statusCode = 404; e.expose = true; throw e;
    }
    const now = new Date();
    const expired = doc.expiresAt <= now;
    res.json({
      shortcode: doc.code,
      originalUrl: doc.url,
      createdAt: doc.createdAt,
      expiry: doc.expiresAt,
      expired,
      totalClicks: doc.clicks,
      clicks: doc.clickLog.map(c => ({
        timestamp: c.ts,
        referrer: c.referrer || null,
        country: c.country || "unknown"
      }))
    });
  } catch (err) {
    next(err);
  }
});

// GET /:code  -> redirection
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const doc = await ShortUrl.findOne({ code });
    if (!doc) {
      const e = new Error("Shortcode not found."); e.statusCode = 404; e.expose = true; throw e;
    }
    if (doc.expiresAt <= new Date()) {
      const e = new Error("Link expired."); e.statusCode = 410; e.expose = true; throw e;
    }

    // coarse geo/click log
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16); // privacy
    const country =
      req.headers["cf-ipcountry"] || req.headers["x-country-code"] || req.headers["x-vercel-ip-country"] || "unknown";

    doc.clicks += 1;
    doc.clickLog.push({
      referrer: req.get("referer"),
      country,
      ipHash,
      userAgent: req.get("user-agent")
    });
    await doc.save();

    res.redirect(doc.url);
  } catch (err) {
    next(err);
  }
});

export default router;
