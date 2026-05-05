export default function isPrime(n: bigint) {
  const zero = BigInt(0);
  const two = BigInt(2);

  if (n < two) return false;
  for (let i = two; i * i <= n; i++) {
    if (n % i === zero) return false;
  }
  return true;
}
