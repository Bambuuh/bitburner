import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.rm("batchTarget.json");
  ns.rm("primeTargetDone.txt");
  const canBatchCost = ns.getScriptRam("canBatch.js", "home");
  let isBatching = false;
  let target = "n00dles";
  while (true) {
    let isPrimed = ns.read("primeTargetDone.txt") === "1";
    const availableHomeRam =
      ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
    const canRunCanBatch = canBatchCost < availableHomeRam;
    if (!isBatching && canRunCanBatch) {
      ns.exec("canBatch.js", "home");
      await ns.sleep(100);
      const obj = ns.read("batchTarget.json");
      if (obj) {
        isBatching = true;
      }
    }

    const obj = ns.read("batchTarget.json");
    if (obj) {
      const parsed = JSON.parse(obj);
      if (parsed.target !== target) {
        isPrimed = false;
        ns.rm("primeTargetDone.txt");
      }
      target = parsed.target;
      ns.print(
        `Using batch target: ${parsed.target} with multiplier: ${parsed.multiplier}`
      );
    }

    ns.exec("hackServers.js", "home");
    await ns.sleep(100);
    ns.exec("copyScripts.js", "home");
    await ns.sleep(100);
    ns.exec("bestHackTarget2.js", "home");
    await ns.sleep(100);

    const bestTarget = ns.read("bestTarget.txt");

    if (canRunCanBatch) {
      ns.exec("canBatch.js", "home", {}, bestTarget);
    }
    ns.exec("buyServers.js", "home");
    await ns.sleep(100);
    if (!isBatching) {
      ns.exec("miniHacker.js", "home");
    } else {
      if (isPrimed) {
        ns.exec("batchHack.js", "home");
      } else {
        ns.exec("primeTarget.js", "home");
      }
    }
    await ns.sleep(1000);
  }
}
