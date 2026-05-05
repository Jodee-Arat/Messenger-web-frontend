import isPrime from "./is-prime";

export default function generatePrime(
  min = BigInt(1000),
  max = BigInt(100000),
): bigint {
  let prime;
  do {
    prime = BigInt(
      Math.floor(
        Number(min + BigInt(Math.floor(Math.random() * Number(max - min))))
      )
    );
  } while (!isPrime(prime));
  return prime;
}
