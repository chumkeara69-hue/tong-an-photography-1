import crypto from "node:crypto";
export function makeOrderNumber() {
  return `TA-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}
export function makeAccessToken() {
  return crypto.randomBytes(24).toString("hex");
}
export function makeDownloadToken() {
  return crypto.randomBytes(32).toString("hex");
}
