import gcd from "../../math/gcd";
import generatePrime from "../../math/generate-prime";
import modInverse from "../../math/mod-inverse";

export default function generateRSAKeyPair() {
  const p = generatePrime(10000n, 1000000n);
  const q = generatePrime(30000n, 6000000n);

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  let e = 65537n;
  while (gcd(e, phi) !== 1n) {
    e += 2n;
  }

  const d = modInverse(e, phi);

  return {
    publicKey: { e, n },
    privateKey: { d, n },
    primes: { p, q }, // можно удалить — только для отладки
  };
}
