import { NS } from "@ns";
import { GROW_SEC, WEAKEN_SEC } from "./constants";

export function growAllServers(
  ns: NS,
  playerServers: string[],
  serversToGrow: string[]
): { growing: string[]; primed: string[] } {
  const growing: string[] = [];
  const primed: string[] = [];

  for (let i = 0; i < serversToGrow.length; i++) {
    const target = serversToGrow[i];
    const maxMoney = ns.getServerMaxMoney(target);
    const currMoney = ns.getServerMoneyAvailable(target);

    if (currMoney < maxMoney) {
      const missingMoneyFactor =
        currMoney === 0 ? maxMoney : maxMoney / currMoney;
      const growThreadsRequired = Math.ceil(
        ns.growthAnalyze(target, missingMoneyFactor)
      );

      const securityChange = growThreadsRequired * GROW_SEC;
      const weakenThreadsRequired = Math.ceil(securityChange / WEAKEN_SEC);

      const growCost = ns.getScriptRam("grow.js");
      const totalGrowCost = growThreadsRequired * growCost;

      const weakenCost = ns.getScriptRam("weaken.js");
      const totalWeakenCost = weakenThreadsRequired * weakenCost;

      const usableGrowServer = playerServers.find(
        (server) =>
          ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >
          totalGrowCost
      );

      if (!usableGrowServer) {
        continue;
      }

      const growTime = ns.getGrowTime(target);
      const weakenTime = ns.getWeakenTime(target);

      const longest = Math.max(growTime, weakenTime);
      const shortest = Math.min(growTime, weakenTime);
      const delay = longest - shortest;

      ns.exec(
        "grow.js",
        usableGrowServer,
        growThreadsRequired,
        target,
        0,
        true
      );
      growing.push(target);
      ns.tprint("Growing ", target);

      const usableWeakenServer = playerServers.find(
        (server) =>
          ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >
          totalWeakenCost
      );

      if (usableWeakenServer) {
        const weakenDelay = weakenTime < growTime ? delay : 0;

        ns.exec(
          "weaken.js",
          usableWeakenServer,
          weakenThreadsRequired,
          target,
          weakenDelay,
          false
        );
        ns.tprint("Weakening ", target);
      }
    } else {
      primed.push(target);
    }
  }

  return { growing, primed };
}
