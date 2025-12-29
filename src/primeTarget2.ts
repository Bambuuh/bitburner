import { NS } from "@ns";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS): Promise<void> {
  const target =
    (ns.args[0] as string) !== ""
      ? (ns.args[0] as string)
      : ns.read("bestTarget.txt");
  const minSecurity = ns.getServerMinSecurityLevel(target);
  const serverSecurity = ns.getServerSecurityLevel(target);
  const maxMoney = ns.getServerMaxMoney(target);
  const currentMoney = ns.getServerMoneyAvailable(target);
  const moneyDiff = maxMoney - currentMoney;
  const servers = getUsableServers(ns);
  const weakenCost = ns.getScriptRam("weaken.js");
  const growCost = ns.getScriptRam("grow.js");
  const weakenTime = ns.getWeakenTime(target);
  const growTime = ns.getGrowTime(target);

  const weakenDiff = serverSecurity - minSecurity;

  const weakenEffect = ns.weakenAnalyze(1);

  let initialWeakenThreadsRequired = Math.ceil(weakenDiff / weakenEffect);

  let primeEndTime: number | undefined = undefined;

  if (serverSecurity > minSecurity) {
    for (const server of servers) {
      const availableRam =
        ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
      const possibleWeakenThreads = Math.floor(availableRam / weakenCost);
      const threads = Math.min(
        initialWeakenThreadsRequired,
        possibleWeakenThreads
      );
      if (threads > 0) {
        primeEndTime = Date.now() + weakenTime + 200;
        // TODO: actually execute the script with the calculated threads
        ns.exec("weaken.js", server, threads, target);
        initialWeakenThreadsRequired -= threads;
      }

      if (initialWeakenThreadsRequired <= 0) {
        break;
      }
    }
  } else if (moneyDiff > 0) {
    const multiplierNeeded = maxMoney / currentMoney;
    const growThreadsNeeded = Math.ceil(
      ns.growthAnalyze(target, multiplierNeeded)
    );
    const growSecurityIncreasePerThread = ns.growthAnalyzeSecurity(1);
    const weakenPerThread = ns.weakenAnalyze(1);

    const weakenThreadsPerGrow = Math.ceil(
      growSecurityIncreasePerThread / weakenPerThread
    );

    let growThreads = 1;
    let isTesting = true;

    let highestPossible = {
      growThreads: 0,
      weakenThreads: 0,
    };

    while (isTesting) {
      let growRemaining = growThreads;
      let weakenRemaining = growThreads * weakenThreadsPerGrow;

      for (const server of servers) {
        const availableRam =
          ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
        const possibleGrowThreads = Math.floor(availableRam / growCost);
        const possibleWeakenThreads = Math.floor(availableRam / weakenCost);
        if (growRemaining > 0 && possibleGrowThreads > 0) {
          const threadsToUse = Math.min(growRemaining, possibleGrowThreads);
          growRemaining -= threadsToUse;
        }
        if (weakenRemaining > 0 && possibleWeakenThreads > 0) {
          const threadsToUse = Math.min(weakenRemaining, possibleWeakenThreads);
          weakenRemaining -= threadsToUse;
        }
        if (weakenRemaining <= 0 && growRemaining <= 0) {
          break;
        }
      }

      if (growRemaining <= 0 && weakenRemaining <= 0) {
        highestPossible = {
          growThreads,
          weakenThreads: growThreads * weakenThreadsPerGrow,
        };

        if (growThreads >= growThreadsNeeded) {
          isTesting = false;
        } else {
          const newGrowThreads = growThreads + 1;
          growThreads = Math.min(newGrowThreads, growThreadsNeeded);
        }
      } else {
        isTesting = false;
      }
    }

    if (highestPossible.growThreads > 0) {
      let growRemaining = highestPossible.growThreads;
      let weakenRemaining = highestPossible.weakenThreads;

      const growStartTime = Date.now() + weakenTime - growTime - 40;
      const weakenStartTIme = Date.now();

      for (const server of servers) {
        const availableRam =
          ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
        const possibleGrowThreads = Math.floor(availableRam / growCost);
        const possibleWeakenThreads = Math.floor(availableRam / weakenCost);
        if (growRemaining > 0 && possibleGrowThreads > 0) {
          const threadsToUse = Math.min(growRemaining, possibleGrowThreads);
          ns.exec("grow.js", server, threadsToUse, target, 0, growStartTime);
          growRemaining -= threadsToUse;
        }
        if (weakenRemaining > 0 && possibleWeakenThreads > 0) {
          const threadsToUse = Math.min(weakenRemaining, possibleWeakenThreads);
          ns.exec(
            "weaken.js",
            server,
            threadsToUse,
            target,
            0,
            weakenStartTIme
          );
          weakenRemaining -= threadsToUse;
        }
        if (weakenRemaining <= 0 && growRemaining <= 0) {
          primeEndTime = Date.now() + weakenTime + 100;
          break;
        }
      }
    }
  }

  if (primeEndTime !== undefined) {
    const primeData: PrimeData = {
      endTime: primeEndTime,
      status: "priming",
      target,
    };
    const primeDataStr = JSON.stringify(primeData);
    ns.write("primeTargetData.txt", primeDataStr, "w");
  } else {
    const primeData: PrimeData = {
      endTime: Date.now(),
      status: "ready",
      target,
    };
    const primeDataStr = JSON.stringify(primeData);
    ns.write("primeTargetData.txt", primeDataStr, "w");
  }
}
