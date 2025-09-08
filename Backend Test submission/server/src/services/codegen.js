import { nanoid } from "nanoid";

export function generateCode(len = 6) {
  // nanoid default alphabet is URL-safe; meets “alphanumeric, reasonable length”
  return nanoid(len);
}
