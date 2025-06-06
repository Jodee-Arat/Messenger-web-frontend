import * as CryptoJS from "crypto-js";

import { prepareDesKey } from "../prepare-des-key";

export const decryptTextDes = (key: string, encryptedText: string) => {
  const desKey = prepareDesKey(key);

  try {
    const decrypted = CryptoJS.DES.decrypt(
      encryptedText,
      CryptoJS.enc.Utf8.parse(desKey),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("Error:", err);
    return "";
  }
};
