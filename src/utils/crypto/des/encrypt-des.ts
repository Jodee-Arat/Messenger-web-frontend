import * as CryptoJS from "crypto-js";

import { prepareDesKey } from "../prepare-des-key";

export const encryptTextDes = (key: string, text: string) => {
  let desKey = prepareDesKey(key);

  try {
    const encrypted = CryptoJS.DES.encrypt(
      text,
      CryptoJS.enc.Utf8.parse(desKey),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return encrypted.toString();
  } catch (err) {
    console.error("Error:", err);
  }
};
