import * as CryptoJS from "crypto-js";

export function prepareDesKey(key: string): string {
  const buf = Buffer.from(key, "utf8");

  if (buf.length === 8) {
    return key;
  }

  if (buf.length > 8) {
    return Buffer.from(buf.buffer, buf.byteOffset, 8).toString("utf8");
  }

  let result = "";
  for (let i = 0; i < 8; i++) {
    result += key.charAt(i % key.length);
  }

  return result;
}

export function prepareDesBytesKey(key: string): CryptoJS.lib.WordArray {
  const padded = key.padEnd(8, key);
  const truncated = padded.substring(0, 8);
  return CryptoJS.enc.Utf8.parse(truncated);
}
