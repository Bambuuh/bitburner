import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const [hostName, delay, shouldNotify] = ns.args;
  if (delay && delay > 0) {
    const delayTime = +delay + 50;
    await ns.sleep(delayTime);
  }

  await ns.weaken(hostName as string);

  if (shouldNotify) {
    ns.writePort(1, hostName as string);
  }
}
