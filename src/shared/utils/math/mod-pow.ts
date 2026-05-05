export function modPow(base: bigint, exponent: bigint, modulus: bigint) {
  base = BigInt(base);
  exponent = BigInt(exponent);
  modulus = BigInt(modulus);
  const zero = BigInt(0);
  const one = BigInt(1);
  const two = BigInt(2);

  if (modulus === one) return zero;
  let result = one;
  base = base % modulus;
  while (exponent > zero) {
    if (exponent % two === one) result = (result * base) % modulus;
    exponent = exponent >> one;
    base = (base * base) % modulus;
  }
  return result;
}
