export function isAnyZero(...args: number[]): boolean {
  return args.some((arg) => arg === 0);
}
