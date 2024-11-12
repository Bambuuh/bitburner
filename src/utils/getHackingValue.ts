import { NS } from "@ns";

type HackingValue = {
  value: number;
  requiredRam: number;
};

export function getHackingValue(
  ns: NS,
  server: string,
  target?: { server: string; hackChance: number }
): HackingValue {
  const maxMoney = ns.getServerMaxMoney(server);
  if (maxMoney <= 0) return { value: 0, requiredRam: 0 };

  const hackChance = getHackChance(ns, server, target);
  const hackTime = ns.getHackTime(server);

  const growthRate = ns.getServerGrowth(server);
  const maxSecurity = ns.getServerMinSecurityLevel(server);
  const currentSecurity = ns.getServerSecurityLevel(server);
  const securityFactor = maxSecurity - currentSecurity;
  const securityPenalty = Math.max(0, securityFactor);

  // Calculate optimal hack percentage and required threads
  const hackPercentage = 0.1; // Can be dynamically adjusted if needed
  const moneyToHack = maxMoney * hackPercentage;
  const hackThreads = Math.ceil(ns.hackAnalyzeThreads(server, moneyToHack));

  const postHackMoney = maxMoney - moneyToHack;
  const growThreads = Math.ceil(
    ns.growthAnalyze(server, maxMoney / postHackMoney)
  );

  const hackSecurityIncrease = ns.hackAnalyzeSecurity(hackThreads);
  const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads);

  const weakenThreadsHack = Math.ceil(hackSecurityIncrease / 0.05);
  const weakenThreadsGrow = Math.ceil(growSecurityIncrease / 0.05);

  // Estimate total RAM required
  const hackScriptRam = ns.getScriptRam("hack.js");
  const growScriptRam = ns.getScriptRam("grow.js");
  const weakenScriptRam = ns.getScriptRam("weaken.js");

  const totalRamRequired =
    hackThreads * hackScriptRam +
    growThreads * growScriptRam +
    (weakenThreadsHack + weakenThreadsGrow) * weakenScriptRam;

  // Calculate hacking value with security adjustment
  const value =
    (maxMoney * hackChance * growthRate) / (hackTime + securityPenalty + 1);

  // Log or return an object with both the hacking value and RAM requirement
  ns.print(`Estimated RAM required for ${server}: ${totalRamRequired} GB`);

  return { value, requiredRam: totalRamRequired };
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
