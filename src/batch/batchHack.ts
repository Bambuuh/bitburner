import { NS } from "@ns";

export async function batchHack(
  ns: NS,
  target: string,
  hackPercentage: number
) {
  if (hackPercentage <= 0.01) {
    return;
  }

  const hackScript = "hack.js";
  const growScript = "grow.js";
  const weakenScript = "weaken.js";

  const hackTime = ns.getHackTime(target);
  const growTime = ns.getGrowTime(target);
  const weakenTime = ns.getWeakenTime(target);

  const serverMaxMoney = ns.getServerMaxMoney(target);
  const moneyToHack = serverMaxMoney * hackPercentage;
  const hackThreads = Math.floor(ns.hackAnalyzeThreads(target, moneyToHack));

  const postHackMoney = serverMaxMoney - moneyToHack;

  const growThreads = Math.ceil(
    ns.growthAnalyze(target, serverMaxMoney / postHackMoney)
  );

  const hackSecurityIncrease = ns.hackAnalyzeSecurity(hackThreads);
  const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads);

  const weakenThreadsHack = Math.ceil(hackSecurityIncrease / 0.05); // 0.05 reduction per weaken thread
  const weakenThreadsGrow = Math.ceil(growSecurityIncrease / 0.05);

  const addedDelay = 20;
  const delayHack = weakenTime - hackTime + addedDelay;
  const delayGrow = weakenTime - growTime + addedDelay;
  const delayWeakenHack = addedDelay;
  const delayWeakenGrow = delayGrow + addedDelay;

  const totalRam = ns.getServerMaxRam("home");
  const usedRam = ns.getServerUsedRam("home");
  const availableRam = totalRam - usedRam;

  const hackCost = ns.getScriptRam(hackScript);
  const growCost = ns.getScriptRam(growScript);
  const weakenCost = ns.getScriptRam(weakenScript);
  const totalCost =
    hackCost * hackThreads +
    growCost * growThreads +
    weakenCost * (weakenThreadsHack + weakenThreadsGrow);

  if (totalCost > availableRam) {
    batchHack(ns, target, hackPercentage - 0.01);
    return;
  }

  if (hackThreads > 0) {
    ns.exec(hackScript, "home", hackThreads, target, delayHack, Date.now());
  }
  if (growThreads > 0) {
    ns.exec(growScript, "home", growThreads, target, delayGrow, Date.now());
  }
  if (weakenThreadsHack > 0) {
    ns.exec(
      weakenScript,
      "home",
      weakenThreadsHack,
      target,
      delayWeakenHack,
      Date.now()
    );
  }
  if (weakenThreadsGrow > 0) {
    ns.exec(
      weakenScript,
      "home",
      weakenThreadsGrow,
      target,
      delayWeakenGrow,
      Date.now()
    );
  }
}
