import * as gostCryptoModule from "gost-crypto/lib/gostCrypto.js";

export type Raw = Uint8Array;

type SubtleCryptoLike = {
  generateKey: (
    algo: Record<string, unknown>,
    extractable: boolean,
    usages: string[],
  ) => Promise<CryptoKeyPair>;
  importKey: (
    format: string,
    keyData: ArrayBuffer | ArrayBufferView,
    algo: Record<string, unknown>,
    extractable: boolean,
    keyUsages: string[],
  ) => Promise<CryptoKey>;
  exportKey: (format: string, key: CryptoKey) => Promise<ArrayBuffer>;
  deriveBits: (
    algo: Record<string, unknown>,
    baseKey: CryptoKey,
    length: number,
  ) => Promise<ArrayBuffer>;
  sign: (
    algo: Record<string, unknown>,
    key: CryptoKey,
    data: ArrayBuffer | ArrayBufferView,
  ) => Promise<ArrayBuffer>;
  verify: (
    algo: Record<string, unknown>,
    key: CryptoKey,
    signature: ArrayBuffer | ArrayBufferView,
    data: ArrayBuffer | ArrayBufferView,
  ) => Promise<boolean>;
  encrypt: (
    algo: Record<string, unknown>,
    key: CryptoKey,
    data: ArrayBuffer | ArrayBufferView,
  ) => Promise<ArrayBuffer>;
  decrypt: (
    algo: Record<string, unknown>,
    key: CryptoKey,
    data: ArrayBuffer | ArrayBufferView,
  ) => Promise<ArrayBuffer>;
  digest: (
    algo: Record<string, unknown>,
    data: ArrayBuffer | ArrayBufferView,
  ) => Promise<ArrayBuffer>;
};

type GostModule = {
  subtle?: SubtleCryptoLike;
  crypto?: { subtle?: SubtleCryptoLike };
  default?: {
    subtle?: SubtleCryptoLike;
    crypto?: { subtle?: SubtleCryptoLike };
  };
  getRandomValues?: (array: Uint8Array) => void;
};

const gostCrypto = gostCryptoModule as unknown as GostModule;

let cachedSubtle: SubtleCryptoLike | null = null;

function subtle(): SubtleCryptoLike {
  if (cachedSubtle) {
    return cachedSubtle;
  }

  const resolved =
    gostCrypto.subtle ??
    gostCrypto.crypto?.subtle ??
    gostCrypto.default?.subtle ??
    gostCrypto.default?.crypto?.subtle;

  if (!resolved) {
    throw new Error("gost-crypto subtle is not available in web runtime");
  }

  cachedSubtle = resolved;
  return resolved;
}

export function utf8(str: string) {
  return new TextEncoder().encode(str);
}

export function decodeUtf8(bytes: Uint8Array) {
  return new TextDecoder("utf-8").decode(bytes);
}

export function toHex(u8: Uint8Array): string {
  return Array.from(u8)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function fromHex(hex: string): Uint8Array {
  const normalized = hex.replace(/\s+/g, "").toLowerCase();
  if (normalized.length % 2 !== 0) {
    throw new Error("fromHex: invalid hex length");
  }

  const out = new Uint8Array(normalized.length / 2);
  for (let index = 0; index < out.length; index += 1) {
    out[index] = Number.parseInt(normalized.slice(index * 2, index * 2 + 2), 16);
  }

  return out;
}

function concatBytes(...parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;

  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }

  return out;
}

function concatMany(parts: Uint8Array[]) {
  return concatBytes(...parts);
}

function toExactArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(u8.byteLength);
  new Uint8Array(buffer).set(u8);
  return buffer;
}

async function hmacStreebog(key: Uint8Array, data: Uint8Array) {
  const algorithm = {
    name: "GOST R 34.11",
    version: 2012,
    length: 256,
    mode: "HMAC",
  } as const;

  const cryptoKey = await subtle().importKey(
    "raw",
    toExactArrayBuffer(key),
    algorithm,
    false,
    ["sign"],
  );

  const signature = await subtle().sign(
    algorithm,
    cryptoKey,
    toExactArrayBuffer(data),
  );

  return new Uint8Array(signature);
}

function fillRandom(bytes: Uint8Array) {
  if (typeof gostCrypto.getRandomValues === "function") {
    gostCrypto.getRandomValues(bytes);
    return;
  }

  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
    return;
  }

  throw new Error("Secure random generator is not available");
}

export async function generateLongTermKeyPair(): Promise<CryptoKeyPair> {
  return subtle().generateKey(
    {
      name: "GOST R 34.10",
      version: 2012,
      namedCurve: "S-256-A",
    },
    true,
    ["sign", "verify", "deriveBits"],
  );
}

export async function generateEphemeralKeyPair(): Promise<CryptoKeyPair> {
  return subtle().generateKey(
    {
      name: "GOST R 34.10",
      version: 2012,
      namedCurve: "S-256-A",
    },
    true,
    ["deriveBits", "sign"],
  );
}

export async function exportPublicRaw(pub: CryptoKey): Promise<Raw> {
  const raw = await subtle().exportKey("raw", pub);
  return new Uint8Array(raw);
}

export async function importPublicRaw(raw: Uint8Array | ArrayBuffer) {
  const u8 = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  return subtle().importKey(
    "raw",
    u8,
    {
      name: "GOST R 34.10",
      version: 2012,
      namedCurve: "S-256-A",
    },
    true,
    ["deriveBits", "verify"],
  );
}

export async function importPrivateRaw(raw: Uint8Array | ArrayBuffer) {
  const u8 = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  return subtle().importKey(
    "raw",
    u8,
    {
      name: "GOST R 34.10",
      version: 2012,
      namedCurve: "S-256-A",
    },
    true,
    ["deriveBits", "sign"],
  );
}

export async function signBytes(priv: CryptoKey, data: Uint8Array) {
  const signature = await subtle().sign({ name: "GOST R 34.10" }, priv, data);
  return new Uint8Array(signature);
}

export async function verifyBytes(
  pub: CryptoKey,
  data: Uint8Array,
  sig: Uint8Array,
) {
  return subtle().verify({ name: "GOST R 34.10" }, pub, sig, data);
}

export async function deriveSharedSecret(
  ourPriv: CryptoKey,
  theirPubRaw: ArrayBuffer,
  ukm: Uint8Array,
) {
  const theirPub = await importPublicRaw(theirPubRaw);
  const algorithm = {
    name: "GOST R 34.10",
    public: theirPub,
    ukm,
    hash: { name: "GOST R 34.11" },
  } as const;

  const bits = await subtle().deriveBits(algorithm, ourPriv, 256);
  return new Uint8Array(bits);
}

export async function kdfStreebog(
  ikm: Uint8Array,
  info: Uint8Array | null,
  outLen = 32,
  opts?: { ukm?: Uint8Array; label?: Uint8Array },
) {
  const label = opts?.label ?? utf8("E2EE");
  const context = opts?.ukm
    ? info
      ? concatBytes(opts.ukm, info)
      : opts.ukm
    : (info ?? new Uint8Array());

  const contextBuffer = toExactArrayBuffer(context);
  const algorithm = {
    name: "GOST R 34.11",
    version: 2012,
    length: 256,
    mode: "KDF",
    context: contextBuffer,
    contex: contextBuffer,
    label: toExactArrayBuffer(label),
  } as const;

  const key = await subtle().importKey(
    "raw",
    toExactArrayBuffer(ikm),
    algorithm,
    false,
    ["deriveBits"],
  );

  const bits = await subtle().deriveBits(algorithm, key, outLen * 8);
  return new Uint8Array(bits);
}

export async function generateKuznechikKey(): Promise<{
  keyBytes: Uint8Array;
  keyHex: string;
}> {
  const keyBytes = new Uint8Array(32);
  fillRandom(keyBytes);

  await subtle().importKey(
    "raw",
    keyBytes,
    {
      name: "GOST R 34.12",
      block: "CTR",
      length: 128,
      iv: new Uint8Array(8),
    },
    false,
    ["encrypt"],
  );

  return {
    keyBytes,
    keyHex: toHex(keyBytes),
  };
}

export async function encryptKuz(cipherKey: Uint8Array, plaintext: Uint8Array) {
  const keyMaterial = await kdfStreebog(
    new Uint8Array(cipherKey),
    utf8("ENC-MAC-KEYS"),
    64,
    {
      label: utf8("KUZ-AUTH"),
    },
  );

  const encKey = new Uint8Array(keyMaterial.slice(0, 32));
  const macKey = new Uint8Array(keyMaterial.slice(32, 64));

  const iv = new Uint8Array(8);
  fillRandom(iv);

  const algorithm = {
    name: "GOST R 34.12",
    block: "CTR",
    length: 128,
    iv,
  } as const;

  const key = await subtle().importKey("raw", encKey, algorithm, false, [
    "encrypt",
  ]);
  const cipherBuffer = await subtle().encrypt(algorithm, key, plaintext);
  const ciphertext = new Uint8Array(cipherBuffer);

  const macData = concatBytes(iv, ciphertext);
  const mac = await hmacStreebog(macKey, macData);

  return {
    iv,
    ciphertext: concatBytes(ciphertext, mac),
  };
}

export async function decryptKuz(
  cipherKey: Uint8Array,
  iv: Uint8Array,
  ciphertextWithMac: Uint8Array,
) {
  if (ciphertextWithMac.byteLength < 32) {
    throw new Error("Ciphertext is too short");
  }

  const keyMaterial = await kdfStreebog(
    new Uint8Array(cipherKey),
    utf8("ENC-MAC-KEYS"),
    64,
    {
      label: utf8("KUZ-AUTH"),
    },
  );

  const encKey = new Uint8Array(keyMaterial.slice(0, 32));
  const macKey = new Uint8Array(keyMaterial.slice(32, 64));

  const cipherLength = ciphertextWithMac.byteLength - 32;
  const ciphertext = ciphertextWithMac.slice(0, cipherLength);
  const receivedMac = ciphertextWithMac.slice(cipherLength);

  const expectedMac = await hmacStreebog(macKey, concatBytes(iv, ciphertext));

  let isValid = true;
  for (let index = 0; index < 32; index += 1) {
    if (receivedMac[index] !== expectedMac[index]) {
      isValid = false;
    }
  }

  if (!isValid) {
    throw new Error("MAC verification failed");
  }

  const algorithm = {
    name: "GOST R 34.12",
    block: "CTR",
    length: 128,
    iv,
  } as const;

  const key = await subtle().importKey("raw", encKey, algorithm, false, [
    "decrypt",
  ]);
  const plainBuffer = await subtle().decrypt(algorithm, key, ciphertext);
  return new Uint8Array(plainBuffer);
}

export type PreKeyBundleServer = {
  ikPub: string;
  spkPub: string;
  spkSig: string;
  opkPubs: string[];
};

export type PreKeyBundleClient = {
  ikPriv: string;
  spkPriv: string;
  opkPriv: string[];
};

export async function generateIdentityKeyPair(): Promise<CryptoKeyPair> {
  return generateLongTermKeyPair();
}

export async function generateSignedPreKeyPair(identityPriv: CryptoKey) {
  const keyPair = await generateEphemeralKeyPair();
  const publicRaw = await exportPublicRaw(keyPair.publicKey);
  const signature = await signBytes(identityPriv, publicRaw);

  return {
    kp: keyPair,
    pubRaw: publicRaw,
    sig: signature,
  };
}

export async function generateOneTimePreKeys(count: number) {
  const bundles: CryptoKeyPair[] = [];

  for (let index = 0; index < count; index += 1) {
    bundles.push(await generateEphemeralKeyPair());
  }

  return bundles;
}

export async function establishSessionX3DH(params: {
  IK: CryptoKeyPair;
  aliceEK: CryptoKeyPair;
  bobBundle: {
    ikPub: string;
    spkPub: string;
    spkSig: string;
    opk?: string | null;
  };
  ukm?: Uint8Array;
}) {
  const ukm =
    params.ukm ??
    (() => {
      const bytes = new Uint8Array(8);
      fillRandom(bytes);
      return bytes;
    })();

  const bobIkPub = await importPublicRaw(fromHex(params.bobBundle.ikPub));
  const verifiedSpk = await verifyBytes(
    bobIkPub,
    fromHex(params.bobBundle.spkPub),
    fromHex(params.bobBundle.spkSig),
  );

  const dh1 = await deriveSharedSecret(
    params.IK.privateKey,
    toExactArrayBuffer(fromHex(params.bobBundle.spkPub)),
    ukm,
  );
  const dh2 = await deriveSharedSecret(
    params.aliceEK.privateKey,
    toExactArrayBuffer(fromHex(params.bobBundle.ikPub)),
    ukm,
  );
  const dh3 = await deriveSharedSecret(
    params.aliceEK.privateKey,
    toExactArrayBuffer(fromHex(params.bobBundle.spkPub)),
    ukm,
  );
  let dh4: Uint8Array | undefined;

  if (params.bobBundle.opk) {
    dh4 = await deriveSharedSecret(
      params.aliceEK.privateKey,
      toExactArrayBuffer(fromHex(params.bobBundle.opk)),
      ukm,
    );
  }

  const mix = concatMany([dh1, dh2, dh3, dh4 ?? new Uint8Array()]);
  const sessionKey = await kdfStreebog(mix, utf8("X3DH-GOST"), 32, {
    ukm,
    label: utf8("X3DH"),
  });

  return {
    sessionKey,
    ukm,
    verifiedSpk,
  };
}

export async function finalizeSessionX3DH(params: {
  bobIKPriv: CryptoKey;
  bobSPKPriv: CryptoKey;
  opkPriv?: CryptoKey;
  envelope: {
    ikAPub: string;
    ekAPub: string;
    usedOpk?: string | null;
    ukm: string;
  };
}) {
  const ukm = fromHex(params.envelope.ukm);

  const dh1 = await deriveSharedSecret(
    params.bobSPKPriv,
    toExactArrayBuffer(fromHex(params.envelope.ikAPub)),
    ukm,
  );
  const dh2 = await deriveSharedSecret(
    params.bobIKPriv,
    toExactArrayBuffer(fromHex(params.envelope.ekAPub)),
    ukm,
  );
  const dh3 = await deriveSharedSecret(
    params.bobSPKPriv,
    toExactArrayBuffer(fromHex(params.envelope.ekAPub)),
    ukm,
  );
  let dh4: Uint8Array | undefined;

  if (params.opkPriv) {
    dh4 = await deriveSharedSecret(
      params.opkPriv,
      toExactArrayBuffer(fromHex(params.envelope.ekAPub)),
      ukm,
    );
  }

  const mix = concatMany([dh1, dh2, dh3, dh4 ?? new Uint8Array()]);
  const sessionKey = await kdfStreebog(mix, utf8("X3DH-GOST"), 32, {
    ukm,
    label: utf8("X3DH"),
  });

  return {
    sessionKey,
  };
}

export type SessionMsgEnvelope = {
  iv: string;
  ct: string;
  sig: string;
};

export async function buildSessionMsgEnvelope(params: {
  sessionKey: Uint8Array;
  plaintext: string | Uint8Array;
  signerIKPriv: CryptoKey;
}) {
  const plaintext =
    typeof params.plaintext === "string"
      ? utf8(params.plaintext)
      : params.plaintext;

  const keyMaterial = await kdfStreebog(params.sessionKey, utf8("MSG-KEYS"), 64, {
    label: utf8("X3DH-MSG"),
  });
  const encKey = keyMaterial.slice(0, 32);
  const encrypted = await encryptKuz(encKey, plaintext);

  const aad = utf8("MSGv1");
  const signature = await signBytes(
    params.signerIKPriv,
    concatBytes(aad, encrypted.iv, encrypted.ciphertext),
  );

  return {
    envelope: {
      iv: toHex(encrypted.iv),
      ct: toHex(encrypted.ciphertext),
      sig: toHex(signature),
    },
    encKey,
  };
}

export async function decryptSessionMsgEnvelope(params: {
  sessionKey: Uint8Array;
  envelope: SessionMsgEnvelope;
  senderIkPub: string | CryptoKey;
}) {
  const keyMaterial = await kdfStreebog(params.sessionKey, utf8("MSG-KEYS"), 64, {
    label: utf8("X3DH-MSG"),
  });
  const encKey = keyMaterial.slice(0, 32);

  const pubKey =
    typeof params.senderIkPub === "string"
      ? await importPublicRaw(fromHex(params.senderIkPub))
      : params.senderIkPub;

  const aad = utf8("MSGv1");
  const sigOk = await verifyBytes(
    pubKey,
    concatBytes(aad, fromHex(params.envelope.iv), fromHex(params.envelope.ct)),
    fromHex(params.envelope.sig),
  );

  const plaintext = await decryptKuz(
    encKey,
    fromHex(params.envelope.iv),
    fromHex(params.envelope.ct),
  );

  return {
    decrypted: decodeUtf8(plaintext),
    sigOk,
  };
}

export async function generatePreKey() {
  const identityKeyPair = await generateIdentityKeyPair();
  const signedPreKey = await generateSignedPreKeyPair(identityKeyPair.privateKey);
  const oneTimePreKeys = await generateOneTimePreKeys(3);

  const serverBundle: PreKeyBundleServer = {
    ikPub: toHex(await exportPublicRaw(identityKeyPair.publicKey)),
    spkPub: toHex(signedPreKey.pubRaw),
    spkSig: toHex(signedPreKey.sig),
    opkPubs: await Promise.all(
      oneTimePreKeys.map(async (opk) => toHex(await exportPublicRaw(opk.publicKey))),
    ),
  };

  const clientBundle: PreKeyBundleClient = {
    ikPriv: toHex(await exportPublicRaw(identityKeyPair.privateKey)),
    spkPriv: toHex(await exportPublicRaw(signedPreKey.kp.privateKey)),
    opkPriv: await Promise.all(
      oneTimePreKeys.map(async (opk) => toHex(await exportPublicRaw(opk.privateKey))),
    ),
  };

  return {
    toServer: serverBundle,
    toStore: clientBundle,
  };
}
