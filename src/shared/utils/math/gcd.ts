export default function gcd(a: bigint, b: bigint): bigint {
  while (b !== BigInt(0)) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}
