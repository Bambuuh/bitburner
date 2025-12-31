import { NS } from "@ns";
import { printServers } from "./printServers";

export async function main(ns: NS): Promise<void> {
  ns.rm("batchTarget.json");
  ns.rm("primeTargetDone.txt");
  ns.rm("primeTargetData.txt");
  ns.rm("nextBatchStart.txt");
  ns.rm("bestTarget.txt");
  ns.disableLog("ALL");
  const canBatchCost = ns.getScriptRam("canBatch.js", "home");
  let isBatching = false;
  let target = "n00dles";
  while (true) {
    ns.exec("hackServers.js", "home");
    ns.exec("copyScripts.js", "home");
    ns.exec("buyServers.js", "home");
    ns.clearLog();
    printServers(ns);
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
      ns.exec("canBatchMain.js", "home");
      const obj = ns.read("batchTarget.json");
      if (obj) {
        isBatching = true;
      }
    }

    if (isBatching) {
      const obj = ns.read("batchTarget.json");
      if (obj) {
        const parsed = JSON.parse(obj);
        const primeDataStr = ns.read("primeTargetData.txt");
        if (parsed.target !== target || primeDataStr === "") {
          ns.exec("primeTarget2.js", "home", {}, parsed.target);
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
    }

    ns.exec("bestHackTarget2.js", "home");

    const bestTarget = ns.read("bestTarget.txt");

    if (canRunCanBatch) {
      ns.exec("canBatchMain.js", "home", {}, bestTarget);
    }
    if (!isBatching) {
      ns.print("Target: n00dles");
      ns.exec("miniHacker.js", "home");
    } else {
      ns.print("Target: " + target);
      if (isPrimed) {
        ns.print("Status: hacking");
        ns.exec("batchHack.js", "home");
      } else {
        ns.print("Status: priming");
        const primeDataStr = ns.read("primeTargetData.txt");
        if (primeDataStr) {
          const primeData: PrimeData = JSON.parse(primeDataStr);
          if (primeData.endTime < Date.now()) {
            ns.exec("primeTarget2.js", "home", {}, target);
          }
        }
      }
    }
    await ns.sleep(1000);
  }
}
