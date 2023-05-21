import { NS } from "@ns";
import { GROW_SEC, WEAKEN_SEC } from "./constants";
import { isAnyZero } from "./utils/isZero";

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
      const totalGrowThreads = Math.ceil(
        ns.growthAnalyze(target, missingMoneyFactor)
      );

      let growThreadsRemaining = totalGrowThreads;
      for (let i = 0; i < playerServers.length; i++) {
        if (growThreadsRemaining === 0) {
          break;
        }
        const server = playerServers[i];
        let growThreads = growThreadsRemaining;
        let counter = 0;

        let done = false;
        while (!done) {
          const securityChange = growThreads * GROW_SEC;
          const weakenThreadsRequired = Math.ceil(securityChange / WEAKEN_SEC);

          const growCost = ns.getScriptRam("grow.js");
          const totalGrowCost = totalGrowThreads * growCost;

          const weakenCost = ns.getScriptRam("weaken.js");
          const totalWeakenCost = weakenThreadsRequired * weakenCost;

          const totalCost = Math.ceil(totalGrowCost + totalWeakenCost);
          const availableRam =
            ns.getServerMaxRam(server) - ns.getServerUsedRam(server);

          if (totalCost > availableRam) {
            counter++;
            growThreads = Math.ceil(growThreadsRemaining * (1 - 0.1 * counter));
            if (growThreads <= 0) {
              done = true;
            }
            continue;
          }

          const growTime = ns.getGrowTime(target);
          const weakenTime = ns.getWeakenTime(target);

          const longest = Math.max(growTime, weakenTime);

          const growDelay = Math.ceil(longest - growTime);
          const weakenDelay = Math.ceil(longest - weakenTime);

          ns.exec("grow.js", server, totalGrowThreads, target, growDelay, true);

          ns.exec(
            "weaken.js",
            server,
            weakenThreadsRequired,
            target,
            weakenDelay,
            false
          );

          growThreadsRemaining -= growThreads;
          done = true;
        }
      }
    } else {
      primed.push(target);
    }
  }

  return { growing, primed };
}
