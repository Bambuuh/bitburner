import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0] as string;
  const targetLandTime = ns.args[1] as number | undefined;

  if (targetLandTime) {
    const server = ns.getServer(target);
    server.hackDifficulty = server.minDifficulty;
    const growTime = ns.formulas.hacking.growTime(server, ns.getPlayer());
    const sleepTime = targetLandTime - Date.now() - growTime;

    if (sleepTime > 0) {
      await ns.sleep(sleepTime);
    }
  }

  await ns.grow(target);
}
