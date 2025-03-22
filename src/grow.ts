import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  // Get arguments
  const target = ns.args[0] as string;
  const delay = (ns.args[1] as number) || 0;
  const batchStartTime = ns.args[2] as number;

  // Calculate how long to sleep
  let sleepTime = delay;

  // If batchStartTime is provided, calculate a more precise sleep time
  if (batchStartTime) {
    const currentTime = Date.now();
    const timeUntilStart = batchStartTime - currentTime;

    // Only adjust if the batch hasn't started yet
    if (timeUntilStart > 0) {
      sleepTime = timeUntilStart + delay;
    }
  }

  // Sleep until it's time to execute
  if (sleepTime > 0) {
    await ns.sleep(sleepTime);
  }

  // Perform the grow
  await ns.grow(target);
}
