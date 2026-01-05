import { NS } from "@ns";
import { printServers } from "./printServers";

export async function main(ns: NS): Promise<void> {
  ns.rm("batchTarget.json");
  ns.rm("primeTargetDone.txt");
  ns.rm("primeTargetData.json");
  ns.rm("nextBatchStart.txt");
  ns.rm("nextBatchEnd.txt");
  ns.rm("bestTarget.txt");
  ns.rm("canHomeShotgun.txt");
  ns.disableLog("ALL");
  const canBatchCost = ns.getScriptRam("canBatch.js", "home");

  ns.exec("maybeStudy.js", "home");
  await ns.sleep(10);

  let isBatching = false;
  // let canShotGun = false;
  let target = "n00dles";
  while (true) {
    ns.exec("hackServers.js", "home");
    await ns.sleep(10);
    ns.exec("buyServers.js", "home");
    await ns.sleep(10);
    ns.exec("copyScripts.js", "home");
    await ns.sleep(10);

    // if (!canShotGun) {
    //   ns.exec("canHomeShotgun.js", "home");
    //   await ns.sleep(10);
    //   const canShotGunValue = ns.read("canHomeShotgun.txt") === "true";
    //   if (canShotGunValue) {
    //     ns.rm("primeTargetData.json");
    //     canShotGun = true;
    //   }
    // }

    ns.exec("tryUpgrade.js", "home");
    await ns.sleep(10);
    ns.exec("handleFactions.js", "home");
    await ns.sleep(10);
    ns.clearLog();
    printServers(ns);
    let isPrimed = false;
    const primeData = ns.read("primeTargetData.json");
    if (primeData) {
      const parsedPrimeData = JSON.parse(primeData);
      isPrimed = parsedPrimeData.status === "ready";
    }
    const availableHomeRam =
      ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
    const canRunCanBatch = canBatchCost < availableHomeRam;
    if (!isBatching && canRunCanBatch) {
      ns.exec("canBatchMain.js", "home");
      await ns.sleep(10);
      const obj = ns.read("batchTarget.json");
      if (obj) {
        isBatching = true;
        ns.rm("batchTarget.json");
      }
    }

    if (isBatching) {
      const obj = ns.read("batchTarget.json");
      if (obj) {
        const parsed = JSON.parse(obj);
        const primeDataStr = ns.read("primeTargetData.json");
        if (parsed.target !== target || primeDataStr === "") {
          ns.exec("primeMain.js", "home", {}, parsed.target);
          await ns.sleep(10);
          const primeData = ns.read("primeTargetData.json");
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
    await ns.sleep(10);

    const bestTarget = ns.read("bestTarget.txt");

    if (canRunCanBatch) {
      ns.exec("canBatchMain.js", "home", {}, bestTarget);
      await ns.sleep(10);
    }
    if (!isBatching) {
      ns.print("Target: n00dles");
      ns.exec("miniHacker.js", "home");
      await ns.sleep(10);
    } else {
      ns.print("Target: " + target);
      if (isPrimed) {
        ns.exec("batchMain.js", "home");
        await ns.sleep(10);
      } else {
        ns.print("Status: priming");
        const primeDataStr = ns.read("primeTargetData.json");
        if (primeDataStr) {
          const primeData: PrimeData = JSON.parse(primeDataStr);
          ns.print(
            `Finished priming at: ${new Date(primeData.endTime)
              .toLocaleTimeString("sv-SE")
              .substring(0, 5)}`
          );
          if (primeData.endTime < Date.now()) {
            ns.exec("primeMain.js", "home", {}, target);
            await ns.sleep(10);
          }
        }
      }
    }
    let sleep = 1000;
    target = isBatching ? target : "n00dles";
    if (isPrimed) {
      const weakenTime = ns.getWeakenTime(target);
      sleep = weakenTime + 100;
    }
    await ns.sleep(sleep);
  }
}
