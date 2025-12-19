import { NS } from "@ns";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS): Promise<void> {
  const target = (ns.args[0] as string) ?? "n00dles";
  const maxMoney = ns.getServerMaxMoney(target);

  const usableServers = getUsableServers(ns);

  const weakenCost = ns.getScriptRam("weaken.js");
  const hackCost = ns.getScriptRam("hack.js");
  const growCost = ns.getScriptRam("grow.js");

  const weakenPerThread = ns.weakenAnalyze(1);

  let multiplier = 0.5;

  while (multiplier > 0.01) {
    const targetMoney = maxMoney * multiplier;
    let hackThreadsNeeded = Math.max(
      1,
      Math.floor(ns.hackAnalyzeThreads(target, targetMoney))
    );
    let growThreadsNeeded = Math.max(
      1,
      Math.ceil(ns.growthAnalyze(target, maxMoney / targetMoney))
    );
    const hackSecurityIncrease = ns.hackAnalyzeSecurity(
      hackThreadsNeeded,
      target
    );
    const growthSecurityIncrease = ns.growthAnalyzeSecurity(
      growThreadsNeeded,
      target
    );
    let hackWeakenThreadsNeeded = Math.ceil(
      hackSecurityIncrease / weakenPerThread
    );
    let growWeakenThreadsNeeded = Math.ceil(
      growthSecurityIncrease / weakenPerThread
    );

    for (const server of usableServers) {
      let availableRam = ns.getServerMaxRam(server);
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
      const obj = {
        target,
        multiplier,
      };
      ns.write("batchTarget.json", JSON.stringify(obj), "w");
      return;
    }
    multiplier -= 0.01;
  }

  ns.rm("batchTarget.txt");
}
