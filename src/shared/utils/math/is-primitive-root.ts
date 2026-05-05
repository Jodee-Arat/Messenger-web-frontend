import isPrime from "./is-prime";

export function isPrimitiveRoot(g: bigint, p: bigint) {
  if (!isPrime(p)) return false;
  let required = new Set();
  const one = BigInt(1);
  for (let i = one; i < p; i++) required.add(i.toString());
  let curr = one;
  for (let i = one; i < p; i++) {
    curr = (curr * g) % p;
    required.delete(curr.toString());
  }
  return required.size === 0;
}
