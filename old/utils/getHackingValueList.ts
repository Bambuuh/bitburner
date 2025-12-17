import { NS } from "@ns";

export function getHackingValueList(ns: NS, servers: string[]) {
  const mapped = servers.map<ValueTarget>((server) => ({
    value: getHackingValue(ns, server),
    server,
  }));

  mapped.sort((a, b) => b.value - a.value);

  return mapped;
}

export function getHackingValue(ns: NS, server: string) {
  const hackingChance = ns.hackAnalyzeChance(server);
  if (hackingChance < 1) {
    return 0;
  }
  const maxMoney = ns.getServerMaxMoney(server);
  const growthRate = ns.getServerGrowth(server) / 100;
  const weakenTime = getEstimateDWeakenTimeAtMinSecurity(ns, server);

  return (maxMoney * growthRate) / weakenTime;
}

function getEstimateDWeakenTimeAtMinSecurity(ns: NS, server: string): number {
  const playerHackingLevel = ns.getHackingLevel();
  const serverMinSecurity = ns.getServerMinSecurityLevel(server);
  const serverBaseDifficulty = ns.getServerBaseSecurityLevel(server);
  const serverBaseWeakenTime = ns.getWeakenTime(server);

  const weakenTimeFactor = 240;

  const adjustedDifficultyRatio = serverMinSecurity / serverBaseDifficulty;
  const minWeakenTime =
    serverBaseWeakenTime * Math.sqrt(adjustedDifficultyRatio);

  const minWeakenTimeEstimation =
    (weakenTimeFactor * minWeakenTime) / playerHackingLevel;

  return minWeakenTimeEstimation;
}
