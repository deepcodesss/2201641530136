import { logError } from "./logger.js";

export function errorHandler(err, req, res, _next) {
  logError(err, req);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: {
      message: err.expose ? err.message : "Internal Server Error"
    }
  });
}
