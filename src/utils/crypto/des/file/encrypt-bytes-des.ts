import * as CryptoJS from "crypto-js";

import { prepareDesBytesKey } from "../../prepare-des-key";

export const encryptBytesDes = (
  key: string,
  bytes: Uint8Array
): Uint8Array | null => {
  const desKey = prepareDesBytesKey(key);

  try {
    const wordArray = CryptoJS.lib.WordArray.create(bytes as any);

    const encrypted = CryptoJS.DES.encrypt(wordArray, desKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    const encryptedWords = CryptoJS.enc.Base64.parse(encrypted.toString());
    return Uint8Array.from(
      CryptoJS.enc.Hex.parse(
        encryptedWords.toString(CryptoJS.enc.Hex)
      ).words.flatMap((word) => [
        (word >> 24) & 0xff,
        (word >> 16) & 0xff,
        (word >> 8) & 0xff,
        word & 0xff,
      ])
    );
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
};
