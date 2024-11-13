import { NS } from "@ns";

export function getGrowthThreads(ns: NS, target: string, factor?: number) {
  const currMoney = ns.getServerMoneyAvailable(target);
  const maxMoney = ns.getServerMaxMoney(target);
  const growthFactor = Math.max(1, factor ?? maxMoney / currMoney);

  return Math.ceil(ns.growthAnalyze(target, growthFactor));
}