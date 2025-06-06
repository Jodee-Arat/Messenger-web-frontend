import { modPow } from "../../math/mod-pow";

export const decryptHashRsa = (
  encryptedHash: string[],
  keyE: bigint,
  keyN: bigint
) => {
  const decryptedBytes: number[] = [];

  for (const encryptedByteStr of encryptedHash) {
    const decryptedByte = modPow(BigInt(encryptedByteStr), keyE, keyN);
    decryptedBytes.push(Number(decryptedByte));
  }

  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(decryptedBytes));
};
