import { describe, expect, it } from "vitest";
import { createRequire } from "module";

import {
  buildSessionMsgEnvelope,
  decryptKuz,
  decryptSessionMsgEnvelope,
  encryptKuz,
  establishSessionX3DH,
  exportPublicRaw,
  fromHex,
  generateEphemeralKeyPair,
  generateIdentityKeyPair,
  generateKuznechikKey,
  generatePreKey,
  importPrivateRaw,
  importPublicRaw,
  signBytes,
  toHex,
  utf8,
  verifyBytes,
  finalizeSessionX3DH,
} from "./gost";

const require = createRequire(import.meta.url);
const gostEngine = require("gost-crypto/lib/gostEngine.js");
(globalThis as unknown as { gostEngine: unknown }).gostEngine = gostEngine;
(globalThis as unknown as { global: unknown }).global = globalThis;

const expectHex = (value: string, minBytes = 1) => {
  expect(value).toMatch(/^[0-9a-f]+$/);
  expect(value.length % 2).toBe(0);
  expect(value.length).toBeGreaterThanOrEqual(minBytes * 2);
};

const expectBytesEqual = (actual: Uint8Array, expected: Uint8Array) => {
  expect(toHex(actual)).toBe(toHex(expected));
};

async function createX3dhFixture() {
  const aliceIdentity = await generateIdentityKeyPair();
  const aliceEphemeral = await generateEphemeralKeyPair();
  const bobPreKey = await generatePreKey();
  const bobBundle = {
    ikPub: bobPreKey.toServer.ikPub,
    spkPub: bobPreKey.toServer.spkPub,
    spkSig: bobPreKey.toServer.spkSig,
    opk: bobPreKey.toServer.opkPubs[0],
  };

  return {
    aliceIdentity,
    aliceEphemeral,
    aliceIdentityPubHex: toHex(await exportPublicRaw(aliceIdentity.publicKey)),
    bobBundle,
    bobIdentityPrivate: await importPrivateRaw(fromHex(bobPreKey.toStore.ikPriv)),
    bobSignedPreKeyPrivate: await importPrivateRaw(
      fromHex(bobPreKey.toStore.spkPriv),
    ),
    bobOneTimePreKeyPrivate: await importPrivateRaw(
      fromHex(bobPreKey.toStore.opkPriv[0]),
    ),
    bobPreKey,
  };
}

describe("web E2EE GOST primitives", () => {
  it("generates a pre-key bundle with verifiable signed pre-key material", async () => {
    const preKey = await generatePreKey();
    const identityPublicKey = await importPublicRaw(fromHex(preKey.toServer.ikPub));

    expectHex(preKey.toServer.ikPub, 64);
    expectHex(preKey.toServer.spkPub, 64);
    expectHex(preKey.toServer.spkSig, 64);
    expect(preKey.toServer.opkPubs).toHaveLength(3);
    preKey.toServer.opkPubs.forEach(value => expectHex(value, 64));
    expectHex(preKey.toStore.ikPriv, 32);
    expectHex(preKey.toStore.spkPriv, 32);
    expect(preKey.toStore.opkPriv).toHaveLength(3);

    await expect(
      verifyBytes(
        identityPublicKey,
        fromHex(preKey.toServer.spkPub),
        fromHex(preKey.toServer.spkSig),
      ),
    ).resolves.toBe(true);
  });

  it("derives the same X3DH session key on both sides", async () => {
    const fixture = await createX3dhFixture();
    const aliceSession = await establishSessionX3DH({
      IK: fixture.aliceIdentity,
      aliceEK: fixture.aliceEphemeral,
      bobBundle: fixture.bobBundle,
      ukm: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
    });
    const bobSession = await finalizeSessionX3DH({
      bobIKPriv: fixture.bobIdentityPrivate,
      bobSPKPriv: fixture.bobSignedPreKeyPrivate,
      opkPriv: fixture.bobOneTimePreKeyPrivate,
      envelope: {
        ikAPub: fixture.aliceIdentityPubHex,
        ekAPub: toHex(await exportPublicRaw(fixture.aliceEphemeral.publicKey)),
        usedOpk: fixture.bobBundle.opk,
        ukm: toHex(aliceSession.ukm),
      },
    });

    expect(aliceSession.verifiedSpk).toBe(true);
    expectBytesEqual(aliceSession.sessionKey, bobSession.sessionKey);
  });

  it("encrypts in Kuznechik CTR mode and rejects tampered MAC data", async () => {
    const { keyBytes } = await generateKuznechikKey();
    const plaintext = utf8("authenticated CTR payload");
    const encrypted = await encryptKuz(keyBytes, plaintext);

    const decrypted = await decryptKuz(
      keyBytes,
      encrypted.iv,
      encrypted.ciphertext,
    );
    expectBytesEqual(decrypted, plaintext);

    const tamperedCiphertext = new Uint8Array(encrypted.ciphertext);
    tamperedCiphertext[0] ^= 1;

    await expect(
      decryptKuz(keyBytes, encrypted.iv, tamperedCiphertext),
    ).rejects.toThrow("MAC");
  });

  it("creates and verifies digital signatures for message bytes", async () => {
    const identity = await generateIdentityKeyPair();
    const data = utf8("signed material");
    const signature = await signBytes(identity.privateKey, data);

    await expect(verifyBytes(identity.publicKey, data, signature)).resolves.toBe(
      true,
    );

    const tamperedData = utf8("signed materiaL");
    await expect(
      verifyBytes(identity.publicKey, tamperedData, signature),
    ).resolves.toBe(false);
  });

  it("wraps and unwraps post-X3DH session messages with signature verification", async () => {
    const fixture = await createX3dhFixture();
    const aliceSession = await establishSessionX3DH({
      IK: fixture.aliceIdentity,
      aliceEK: fixture.aliceEphemeral,
      bobBundle: fixture.bobBundle,
    });
    const message = "session message after X3DH";
    const { envelope } = await buildSessionMsgEnvelope({
      sessionKey: aliceSession.sessionKey,
      plaintext: message,
      signerIKPriv: fixture.aliceIdentity.privateKey,
    });

    const decrypted = await decryptSessionMsgEnvelope({
      sessionKey: aliceSession.sessionKey,
      envelope,
      senderIkPub: fixture.aliceIdentityPubHex,
    });

    expect(decrypted.decrypted).toBe(message);
    expect(decrypted.sigOk).toBe(true);
  });
});
