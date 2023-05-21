export function compressionOne(input: string): string {
  const chars = input.split("");

  const res: string[] = [];

  let lastChar = chars[0];
  let charCount = 0;
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    if (char === lastChar) {
      charCount++;
      if (charCount === 9) {
        res.push(`${charCount}${lastChar}`);
        charCount = 0;
      }
    } else {
      res.push(`${charCount}${lastChar}`);
      charCount = 1;
    }

    if (i === chars.length - 1) {
      res.push(`${charCount}${char}`);
    }

    lastChar = char;
  }

  return res.join("");
}
