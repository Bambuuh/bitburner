import { NS } from "@ns";

export function batchPrepp(
  ns: NS,
  target: string
): { target: string; TTL: number } | undefined {
  const host = "home";
  const growScript = "grow.js";
  const weakenScript = "weaken.js";
  const weakenCost = ns.getScriptRam(weakenScript);
  const growCost = ns.getScriptRam(growScript);

  const weakenTime = ns.getWeakenTime(target);
  const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

  const serverSecurity = ns.getServerSecurityLevel(target);
  const serverMinSecurity = ns.getServerMinSecurityLevel(target);
  const missingSecurity = serverSecurity - serverMinSecurity;

  if (missingSecurity > 0) {
    const weakenPerThread = ns.weakenAnalyze(1);
    const threadsNeeded = Math.ceil(missingSecurity / weakenPerThread);
    const ramCost = weakenCost * threadsNeeded;
    if (threadsNeeded > 0 && availableRam >= ramCost) {
      ns.exec(weakenScript, host, threadsNeeded, target, 0, Date.now());
      return { target, TTL: weakenTime + 50 };
    }
  }

  const serverMaxMoney = ns.getServerMaxMoney(target);
  const currentMoney = ns.getServerMoneyAvailable(target);
  const missingMoney = serverMaxMoney - currentMoney;

  if (serverMaxMoney > 0 && missingMoney > 0) {
    let multiplier =
      Math.ceil(getGrowthMultiplier(serverMaxMoney, currentMoney) * 100) / 100;

    while (multiplier >= 1) {
      const growThreads = Math.ceil(ns.growthAnalyze(target, multiplier));
      const weakenThreads = Math.ceil((growThreads * 0.004) / 0.05);
      const ramCost = growThreads * growCost + weakenThreads * weakenCost;

      if (ramCost <= availableRam && growThreads > 0 && weakenThreads > 0) {
        const weakenTime = ns.getWeakenTime(target);
        ns.exec(growScript, host, growThreads, target, 0, Date.now());
        ns.exec(weakenScript, host, weakenThreads, target, 0, Date.now());
        return { target, TTL: weakenTime + 50 };
      }

      multiplier -= 0.1;
    }
  }

  return undefined;
}

function getGrowthMultiplier(maxMoney: number, currentMoney: number) {
  if (currentMoney <= 0) {
    return 10;
  }

  const growthMultiplier = (maxMoney - currentMoney) / currentMoney;
  return growthMultiplier;
}
