type PrimeData = {
  status: "priming" | "ready";
  target: string;
  endTime: number;
};

type BatchData = {
  target: string;
  multiplier: number;
};
