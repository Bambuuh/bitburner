import { NS } from "@ns";
import { PORTS } from "./PORTS";
import { grow } from "./grow";
import { hack } from "./hack";
import { weaken } from "./weaken";

console.log(grow);
console.log(hack);
console.log(weaken);

const tailWidth = 278;
const tailHeight = 470;
const infoWindowWidth = 188;

export async function main(ns: NS): Promise<void> {
  const [width] = ns.ui.windowSize();
  ns.ui.openTail();
  ns.ui.resizeTail(tailWidth, tailHeight);
  ns.ui.moveTail(width - tailWidth - infoWindowWidth, 0);
  ns.rm("batchTarget.json");
  ns.rm("primeTargetDone.txt");
  ns.rm("primeTargetData.json");
  ns.rm("nextBatchStart.txt");
  ns.rm("nextBatchEnd.txt");
  ns.rm("bestTarget.txt");
  ns.rm("canHomeShotgun.txt");
  ns.disableLog("ALL");
  const canBatchCost = ns.getScriptRam("canBatch.js", "home");
  let oldMoney = ns.getPlayer().money;

  // ns.exec("maybeStudy.js", "home");
  // await ns.sleep(10);
  let shouldShare = false;
  let shouldExpFarm = false;

  let isBatching = false;
  // let canShotGun = false;
  let target = "n00dles";
  while (true) {
    ns.exec(
      "printStatus.js",
      "home",
      {},
      oldMoney,
      target,
      shouldShare,
      shouldExpFarm
    );
    await ns.sleep(10);
    const statusContent = ns.read("status.json");
    if (statusContent) {
      ns.clearLog();
      const list = JSON.parse(statusContent);
      list.forEach((line: string) => ns.print(line));
    }
    ns.exec("tryUpgrade.js", "home");
    await ns.sleep(10);
    ns.exec("miniFactions.js", "home");
    await ns.sleep(10);
    ns.exec("handleFactions.js", "home");
    await ns.sleep(10);
    ns.exec("hackServers.js", "home");
    await ns.sleep(10);
    ns.exec("buyServers.js", "home");
    await ns.sleep(10);
    ns.exec("copyScripts.js", "home");
    await ns.sleep(10);
    ns.exec("shouldStartSharing.js", "home", {}, target, oldMoney);
    await ns.sleep(10);
    shouldShare = ns.readPort(PORTS.startSharing) === true;
    if (shouldShare) {
      ns.exec("shareAll.js", "home");
      await ns.sleep(10000 + 100);
      continue;
    }
    ns.exec("shouldExpFarm.js", "home");
    await ns.sleep(10);
    shouldExpFarm = ns.readPort(PORTS.startExpFarm) === true;
    if (shouldExpFarm) {
      const primeTargetDataStr = ns.read("primeTargetData.json");
      const primeTargetData: PrimeData =
        primeTargetDataStr && JSON.parse(primeTargetDataStr);
      if (!primeTargetData || primeTargetData.target !== "joesguns") {
        ns.exec("primeMain.js", "home", {}, "joesguns");
      } else if (primeTargetData.status === "ready") {
        ns.exec("expFarm.js", "home");
      } else if (primeTargetData.endTime < Date.now()) {
        ns.exec("primeMain.js", "home", {}, "joesguns");
        await ns.sleep(10);
      }
      continue;
    }

    // if (!canShotGun) {
    //   ns.exec("canHomeShotgun.js", "home");
    //   await ns.sleep(10);
    //   const canShotGunValue = ns.read("canHomeShotgun.txt") === "true";
    //   if (canShotGunValue) {
    //     ns.rm("primeTargetData.json");
    //     canShotGun = true;
    //   }
    // }

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
        }
        target = parsed.target;
      }
    }

    ns.exec("bestHackTarget2.js", "home", {}, isBatching);
    await ns.sleep(10);

    const bestTarget = ns.read("bestTarget.txt");

    if (canRunCanBatch) {
      ns.exec("canBatchMain.js", "home", {}, bestTarget);
      await ns.sleep(10);
    }
    if (!isBatching) {
      ns.exec("miniHacker.js", "home");
      await ns.sleep(10);
    } else {
      if (isPrimed) {
        ns.exec("batchMain.js", "home");
        await ns.sleep(10);
      } else {
        const primeDataStr = ns.read("primeTargetData.json");
        if (primeDataStr) {
          const primeData: PrimeData = JSON.parse(primeDataStr);
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
    oldMoney = ns.getPlayer().money;

    // TODO: run shareAll if more than 10 seconds left

    // TODO: calculate which mltiplier gives the most money

    await ns.sleep(sleep);
  }
}
