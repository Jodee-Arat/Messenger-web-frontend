export default function modInverse(e: bigint, phi: bigint) {
  let [a, b] = [e, phi];
  const zero = BigInt(0);
  let [x0, x1] = [zero, BigInt(1)];

  while (a !== zero) {
    const q = b / a;
    [b, a] = [a, b % a];
    [x0, x1] = [x1, x0 - q * x1];
  }

  return x0 < zero ? x0 + phi : x0;
}
