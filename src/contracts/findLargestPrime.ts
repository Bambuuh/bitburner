function isPrime(num: number): boolean {
  const max = Math.ceil(Math.sqrt(num));
  for (let i = 2; i <= max; i++) {
    if (num % i === 0) {
      return false;
    }
  }
  return true;
}

export function findLargestFactor(num: number): number {
  let counter = Math.ceil(num / 2);
  do {
    if (num % counter === 0 && isPrime(counter)) {
      break;
    }
  } while (--counter > 1);
  return counter === 1 ? -1 : counter;
}
