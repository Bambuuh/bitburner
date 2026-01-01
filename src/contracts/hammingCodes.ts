export function hammingCodes(bits: string) {
  const list = bits.split("");

  console.log(list.length);

  const turnedOnBitIndexes = list
    .map((_, index) => index)
    .filter((index: number) => list[index] === "1");

  const parity = turnedOnBitIndexes.reduce((res, index) => res ^ index, 0);

  if (parity > 0) {
    console.log("PARITY", parity);
    console.log(list);
    list[parity] = list[parity] === "0" ? "1" : "0";
    console.log(list);
  }

  const res = list
    .filter(
      (_, index) => index !== 0 && (Math.log(index) / Math.log(2)) % 1 !== 0
    )
    .join("");

  return res.length > 0 ? res : undefined;
}
