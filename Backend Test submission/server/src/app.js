import express from "express";
import routes from "./routes.js";
import { requestLogger } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/error.js";

const app = express();

// required by spec: use *your* logging middleware extensively
app.use(requestLogger);

app.use(express.json({ limit: "50kb" }));
app.use(routes);

// error handler last
app.use(errorHandler);

export default app;
