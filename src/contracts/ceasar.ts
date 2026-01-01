export function ceasar(text: string, leftShift: number) {
  const alphabet = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const converted = text
    .split("")
    .map((char) => {
      const index = alphabet.indexOf(char);
      if (index === -1) return char;
      const newIndex = (index - leftShift + 26) % 26;
      return alphabet[newIndex];
    })
    .join("");

  return converted;
}
