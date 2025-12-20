import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.rm("batchTarget.json");
  ns.rm("primeTargetDone.txt");
  const canBatchCost = ns.getScriptRam("canBatch.js", "home");
  let isBatching = false;
  let target = "n00dles";
  while (true) {
    let isPrimed = false;
    const primeData = ns.read("primeTargetData.txt");
    if (primeData) {
      const parsedPrimeData = JSON.parse(primeData);
      isPrimed = parsedPrimeData.status === "ready";
    }
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
        ns.exec("primeTarget2.js", "home");
        await ns.sleep(100);
        const primeData = ns.read("primeTargetData.txt");
        if (primeData) {
          const parsedPrimeData = JSON.parse(primeData);
          isPrimed = parsedPrimeData.status === "ready";
        }
        ns.tprint(
          `Using batch target: ${parsed.target} with multiplier: ${parsed.multiplier}`
        );
      }
      target = parsed.target;
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
        const primeDataStr = ns.read("primeTargetData.txt");
        if (primeDataStr) {
          const primeData: PrimeData = JSON.parse(primeDataStr);
          if (primeData.endTime < Date.now()) {
            ns.exec("primeTarget2.js", "home");
          }
        }
      }
    }
    await ns.sleep(1000);
  }
}
