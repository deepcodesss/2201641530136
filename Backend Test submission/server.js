import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./server/src/app.js";

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

async function main() {
  await mongoose.connect(MONGO_URI, { autoIndex: true });
  app.listen(PORT, () => {});
}
main().catch(() => process.exit(1));
