const mockgrid = [
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
];

function getInboundSurroundingBoxes(
  grid: (string | number)[][],
  coords: number[]
) {
  const rightCoordinates = [coords[0], coords[1] + 1];
  const leftCoordinates = [coords[0], coords[1] - 1];
  const upCoordinates = [coords[0] - 1, coords[1]];
  const downCoordinates = [coords[0] + 1, coords[1]];

  const allCoordinates = [
    rightCoordinates,
    leftCoordinates,
    upCoordinates,
    downCoordinates,
  ];

  return allCoordinates.filter(
    (coords) =>
      coords[0] >= 0 &&
      coords[0] < grid.length &&
      coords[1] >= 0 &&
      coords[1] < grid[0].length
  );
}

function checkSurroundingBoxes(
  grid: (string | number)[][],
  position: number[],
  steps: number
) {
  const surroundingBoxes = getInboundSurroundingBoxes(grid, position);

  surroundingBoxes.forEach((box) => {
    if (grid[box[0]][box[1]] === "*") {
      grid[box[0]][box[1]] = steps + 1;
    }
  });
}

function reverseTraceSteps(
  grid: (string | number)[][],
  position: number[],
  steps: number
) {
  let isDone = false;
  let currentStep = steps;
  let currentPos = position;
  const path: number[][] = [position];

  while (!isDone) {
    const getSurroundingBoxes = getInboundSurroundingBoxes(grid, currentPos);
    const nextPosition = getSurroundingBoxes.find(
      (box) => grid[box[0]][box[1]] === currentStep - 1
    );
    if (nextPosition) {
      path.unshift(nextPosition);
      currentPos = nextPosition;
    }
    if (currentStep === 0) {
      isDone = true;
    }
    currentStep--;
  }

  const pathString: string[] = [];

  path.forEach((pos, index) => {
    if (index + 1 > path.length - 1) {
      return;
    }
    const nextPos = path[index + 1];
    if (pos[0] < nextPos[0]) {
      pathString.push("D");
    }
    if (pos[0] > nextPos[0]) {
      pathString.push("U");
    }
    if (pos[1] > nextPos[1]) {
      pathString.push("L");
    }
    if (pos[1] < nextPos[1]) {
      pathString.push("R");
    }
  });

  return pathString.join("");
}

function getNextBoxes(grid: (string | number)[][], steps: number) {
  // get all positions with value === steps
  const positions: number[][] = [];
  grid.forEach((row, rowIndex) =>
    row.forEach((cell, cellIndex) => {
      if (cell === steps) {
        positions.push([rowIndex, cellIndex]);
      }
    })
  );
  return positions;
}

export function shortestPathInAGrid(grid: number[][]): string {
  const preppedGrid: (number | string)[][] = grid.map((row) =>
    row.map((cell) => (cell === 0 ? "*" : "x"))
  );

  preppedGrid[0][0] = 0;

  let steps = 0;
  const finalBoxPosition = [preppedGrid.length - 1, preppedGrid[0].length - 1];
  let isfinished =
    preppedGrid[finalBoxPosition[0]][finalBoxPosition[1]] !== "*";
  // const totalSteps = preppedGrid.length + preppedGrid[0].length;

  checkSurroundingBoxes(preppedGrid, [0, 0], steps);
  steps++;

  while (!isfinished) {
    const nextBoxes = getNextBoxes(preppedGrid, steps);
    if (nextBoxes.length === 0) {
      return "";
    }

    nextBoxes.forEach((box) => {
      checkSurroundingBoxes(preppedGrid, box, steps);
    });

    isfinished = preppedGrid[finalBoxPosition[0]][finalBoxPosition[1]] !== "*";
    steps++;
  }

  const path = reverseTraceSteps(preppedGrid, finalBoxPosition, steps);

  return path;
}
