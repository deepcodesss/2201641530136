import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.resolve(__dirname, "../../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, "app.log");

function write(line) {
  fs.appendFile(logFile, line + "\n", () => {});
}

export function requestLogger(req, res, next) {
  const started = Date.now();
  const { method, originalUrl } = req;
  const rid = Math.random().toString(36).slice(2, 10);

  res.on("finish", () => {
    const ms = Date.now() - started;
    const record = {
      t: new Date().toISOString(),
      rid,
      method,
      url: originalUrl,
      status: res.statusCode,
      ms,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      ua: req.headers["user-agent"]
    };
    write(JSON.stringify(record));
  });

  next();
}

export function logError(err, req) {
  const rec = {
    t: new Date().toISOString(),
    type: "error",
    url: req?.originalUrl,
    msg: err.message,
    stack: err.stack?.split("\n").slice(0, 3).join(" | ")
  };
  write(JSON.stringify(rec));
}
