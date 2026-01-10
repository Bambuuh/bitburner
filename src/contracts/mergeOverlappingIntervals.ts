export function mergeOverlappingIntervals(intervals: number[][]) {
  intervals.sort(([minA], [minB]) => minA - minB);
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const [min, max] = intervals[i];
      const [laterMin, laterMax] = intervals[j];
      if (laterMin <= max) {
        const newMax = laterMax > max ? laterMax : max;
        const newInterval = [min, newMax];
        intervals[i] = newInterval;
        intervals.splice(j, 1);
        j = i;
      }
    }
  }
  return intervals;
}

/*
You are attempting to solve a Coding Contract. 
You have 15 tries remaining, after which the contract will self-destruct.


Given the following array of arrays of numbers representing a list of intervals, 
merge all overlapping intervals.

[[13,16],[5,12],[4,8],[16,25],[20,22]]

Example:

[[1, 3], [8, 10], [2, 6], [10, 16]]

would merge into [[1, 6], [8, 16]].

The intervals must be returned in ASCENDING order. 
You can assume that in an interval, 
the first number will always be smaller than the second.


If your solution is an empty string, 
you must leave the text box empty. Do not use "", '', or ``.
*/
