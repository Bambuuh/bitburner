import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.rm("batchTarget.json");
  const canBatchCost = ns.getScriptRam("canBatch.js", "home");
  let isBatching = false;
  while (true) {
    const availableHomeRam =
      ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
    if (canBatchCost < availableHomeRam) {
      ns.exec("canBatch.js", "home");
      await ns.sleep(100);
      const obj = ns.read("batchTarget.json");
      if (obj) {
        isBatching = true;
      }
    }

    ns.exec("hackServers.js", "home");
    await ns.sleep(100);
    ns.exec("copyScripts.js", "home");
    await ns.sleep(100);
    // ns.exec("buyServers.js", "home");
    // await ns.sleep(100);
    if (!isBatching) {
      ns.exec("bestHackTarget.js", "home");
      await ns.sleep(100);
      ns.exec("miniHacker.js", "home");
    } else {
      ns.exec("batchHack.js", "home");
    }
    await ns.sleep(1000);
  }
}
