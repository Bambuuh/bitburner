type Response = 1 | 0;

export function arrayJumpingGame(numbers: number[]): Response {
  // TODO: implement array jumping game logic
  // This is a classic dynamic programming problem
  // We need to determine if we can reach the end of the array
  // from the first index by jumping according to the values in the array

  function checkNext(index: number): Response {
    if (index >= numbers.length - 1) {
      return 1;
    }
    const num = numbers[index];
    if (num === 0) {
      return 0;
    }
    const nextIndex = index + num;
    return checkNext(nextIndex);
  }

  return checkNext(0);
}

console.log(arrayJumpingGame([1, 1, 1, 1])); // should output 1
console.log(arrayJumpingGame([2, 3, 1, 1, 4])); // should output 1
console.log(arrayJumpingGame([3, 2, 1, 0, 4])); // should output 0
