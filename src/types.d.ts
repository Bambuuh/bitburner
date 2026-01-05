type PrimeData = {
  status: "weakening" | "growing" | "ready";
  target: string;
  endTime: number;
};

type BatchData = {
  target: string;
  multiplier: number;
};
