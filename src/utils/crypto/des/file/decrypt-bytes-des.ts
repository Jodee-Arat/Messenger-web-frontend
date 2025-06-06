import * as CryptoJS from "crypto-js";

import { prepareDesBytesKey } from "../../prepare-des-key";

export const decryptBytesDes = (
  key: string,
  encryptedBytes: Uint8Array
): Uint8Array | null => {
  try {
    const desKey = prepareDesBytesKey(key);

    const encryptedWordArray = CryptoJS.lib.WordArray.create(
      encryptedBytes as any
    );

    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: encryptedWordArray } as any,
      desKey,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const words = decrypted.words;
    const sigBytes = decrypted.sigBytes;

    const result = new Uint8Array(sigBytes);

    for (let i = 0; i < sigBytes; i++) {
      result[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    return result;
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
};
