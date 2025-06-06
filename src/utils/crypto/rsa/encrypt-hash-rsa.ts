import { modPow } from "../../math/mod-pow";

export const encryptHashRsa = (hash: string, keyD: bigint, keyN: bigint) => {
  const encoder = new TextEncoder();
  const hashBytes = encoder.encode(hash);

  const encrypted: string[] = [];

  for (const byte of hashBytes) {
    const encryptedByte = modPow(BigInt(byte), keyD, keyN);
    encrypted.push(encryptedByte.toString());
  }

  return encrypted;
};
