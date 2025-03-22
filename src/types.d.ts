type ValueTarget = {
  value: number;
  server: string;
};

type PrimeCandidate = {
  server: string;
  TTL: number;
  status: "weakening" | "growing" | "primed";
  weakenTime?: number;
};
