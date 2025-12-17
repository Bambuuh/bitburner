import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0] as string;
  const delay = (ns.args[1] as number) || 0;
  const batchStartTime = ns.args[2] as number;

  let sleepTime = delay;

  if (batchStartTime) {
    const currentTime = Date.now();
    const timeUntilStart = batchStartTime - currentTime;

    if (timeUntilStart > 0) {
      sleepTime = timeUntilStart + delay;
    }
  }

  if (sleepTime > 0) {
    await ns.sleep(sleepTime);
  }

  await ns.weaken(target);
}
