export function arrayJumpingGameII(numbers: number[]): number {
  let jumps = 0;
  function checkNext(index: number): number {
    console.log("---------------------------");
    jumps += 1;

    let maxJumps = numbers[index];

    console.log("index", index, jumps);

    for (let i = maxJumps; i > 0; i--) {
      const nextIndex = index + maxJumps;
      console.log("checking nextIndex", nextIndex);

      if (maxJumps <= 0) {
        console.log(1);
        return 0;
      }
      if (nextIndex >= numbers.length - 1) {
        console.log(2, "reached end", nextIndex, numbers.length - 1);
        console.log("reached end");
        return jumps;
      }

      if (numbers[nextIndex] > 0) {
        console.log(3);
        break;
      }

      console.log(4);
      maxJumps--;
    }
    if (jumps > 10) {
      return -1;
    }

    const next = index + maxJumps;
    if (next > index) {
      console.log("recursing with index", next);
      return checkNext(next);
    }

    console.log("cannot jump further, returning 0");
    return 0;
  }

  return checkNext(0);
}

console.log(arrayJumpingGameII([1, 1, 1]) === 3); // should output 3
console.log(arrayJumpingGameII([2, 1, 1]) === 2); // should output 2
console.log(arrayJumpingGameII([2, 0, 1]) === 2); // should output 2
console.log("can NOT finish:", arrayJumpingGameII([2, 1, 0, 1]) === 0); // should output 0
console.log("can finish:", arrayJumpingGameII([2, 2, 0, 1]) === 3); // should output 3

// console.log(
//   arrayJumpingGameII([5, 5, 3, 5, 0, 1, 1, 2, 0, 6, 3, 1, 0, 1, 2, 3, 0, 1])
// ); // should output 1
