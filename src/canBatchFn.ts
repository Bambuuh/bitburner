import { NS } from "@ns";
import { getMockServer } from "./getMockServer";
import { getUsableServers } from "./getUsableServers";

export function canBatch(ns: NS, target: string): BatchData | undefined {
  const moneyMax = ns.getServerMaxMoney(target);
  const player = ns.getPlayer();

  if (moneyMax === 0) {
    return;
  }

  const usableServers = getUsableServers(ns);

  const weakenCost = ns.getScriptRam("weaken.js");
  const hackCost = ns.getScriptRam("hack.js");
  const growCost = ns.getScriptRam("grow.js");
  const batchHackCost = ns.getScriptRam("batchHack.js");

  const weakenPerThread = ns.weakenAnalyze(1);

  let multiplier = 0.9;

  const mockPrimedServer = getMockServer(ns, target);

  const hackPercentPerThread = ns.formulas.hacking.hackPercent(
    mockPrimedServer,
    player
  );

  while (multiplier > 0.01) {
    const mockHackedServer = getMockServer(ns, target, {
      hackedMoneyMult: multiplier,
    });

    let hackThreadsNeeded = Math.max(
      1,
      Math.floor(multiplier / hackPercentPerThread)
    );

    let growThreadsNeeded = Math.ceil(
      ns.formulas.hacking.growThreads(
        mockHackedServer,
        player,
        mockHackedServer.moneyMax ?? 1
      ) * 1.1
    );

    const hackSecurityIncrease = ns.hackAnalyzeSecurity(hackThreadsNeeded);
    const growthSecurityIncrease = ns.growthAnalyzeSecurity(growThreadsNeeded);

    let hackWeakenThreadsNeeded = Math.ceil(
      (hackSecurityIncrease / weakenPerThread) * 1.1
    );
    let growWeakenThreadsNeeded = Math.ceil(
      (growthSecurityIncrease / weakenPerThread) * 1.1
    );

    for (const server of usableServers) {
      let availableRam =
        ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
      if (server === "home") {
        availableRam -= batchHackCost;
      }
      const possibleHackThreads = Math.floor(availableRam / hackCost);
      if (hackThreadsNeeded > 0 && possibleHackThreads > 0) {
        const threadsToUse = Math.min(hackThreadsNeeded, possibleHackThreads);
        hackThreadsNeeded -= threadsToUse;
        availableRam -= threadsToUse * hackCost;
      }

      const possibleGrowThreads = Math.floor(availableRam / growCost);

      if (growThreadsNeeded > 0 && possibleGrowThreads > 0) {
        const threadsToUse = Math.min(growThreadsNeeded, possibleGrowThreads);
        growThreadsNeeded -= threadsToUse;
        availableRam -= threadsToUse * growCost;
      }

      const possibleHackWeakenThreads = Math.floor(availableRam / weakenCost);
      if (hackWeakenThreadsNeeded > 0 && possibleHackWeakenThreads > 0) {
        const threadsToUse = Math.min(
          hackWeakenThreadsNeeded,
          possibleHackWeakenThreads
        );
        hackWeakenThreadsNeeded -= threadsToUse;
        availableRam -= threadsToUse * weakenCost;
      }

      const possibleGrowWeakenThreads = Math.floor(availableRam / weakenCost);
      if (growWeakenThreadsNeeded > 0 && possibleGrowWeakenThreads > 0) {
        const threadsToUse = Math.min(
          growWeakenThreadsNeeded,
          possibleGrowWeakenThreads
        );
        growWeakenThreadsNeeded -= threadsToUse;
        availableRam -= threadsToUse * weakenCost;
      }
    }

    if (
      hackThreadsNeeded === 0 &&
      growThreadsNeeded === 0 &&
      hackWeakenThreadsNeeded === 0 &&
      growWeakenThreadsNeeded === 0
    ) {
      return {
        target,
        multiplier,
      };
    }
    multiplier -= 0.01;
  }

  return;
}
