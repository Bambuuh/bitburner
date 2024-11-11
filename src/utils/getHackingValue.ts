import { NS } from "@ns";

export function getHackingValue(
  ns: NS,
  server: string,
  target?: { server: string; hackChance: number }
) {
  const maxMoney = ns.getServerMaxMoney(server);
  if (maxMoney <= 0) return 0;

  const hackChance = getHackChance(ns, server, target);
  const hackTime = ns.getHackTime(server);

  const growthRate = ns.getServerGrowth(server);
  const maxSecurity = ns.getServerMinSecurityLevel(server);
  const currentSecurity = ns.getServerSecurityLevel(server);

  const securityFactor = maxSecurity - currentSecurity;

  const securityPenalty = Math.max(0, securityFactor);

  const value =
    (maxMoney * hackChance * growthRate) / (hackTime + securityPenalty + 1);
  return value;
}

function getHackChance(
  ns: NS,
  server: string,
  target?: { server: string; hackChance: number }
) {
  if (target && server === target.server) {
    return target.hackChance;
  }

  return ns.hackAnalyzeChance(server);
}
