import { NS } from "@ns";
import { getUsableServers } from "./getUsableServers";

type BatchItem = {
  host: string;
  script: string;
  threads: number;
  delay: number;
};

export async function main(ns: NS): Promise<void> {
  const obj = ns.read("batchTarget.json");
  const earliestStart = ns.read("nextBatchStart.txt");
  const earliestStartTime = earliestStart ? parseInt(earliestStart, 10) : 0;

  if (!obj) {
    return;
  }

  const { target, multiplier } = JSON.parse(obj);

  const maxMoney = ns.getServerMaxMoney(target);

  const usableServers = getUsableServers(ns);

  const weakenCost = ns.getScriptRam("weaken.js");
  const hackCost = ns.getScriptRam("hack.js");
  const growCost = ns.getScriptRam("grow.js");
  const weakenTime = ns.getWeakenTime(target);
  const hackTime = ns.getHackTime(target);
  const growTime = ns.getGrowTime(target);

  const weakenPerThread = ns.weakenAnalyze(1);

  const targetMoney = maxMoney * multiplier;
  const baseHackThreadsNeeded = Math.max(
    1,
    Math.floor(ns.hackAnalyzeThreads(target, targetMoney))
  );
  const baseGrowThreadsNeeded = Math.max(
    1,
    Math.ceil(ns.growthAnalyze(target, maxMoney / targetMoney))
  );
  const hackSecurityIncrease = ns.hackAnalyzeSecurity(
    baseHackThreadsNeeded,
    target
  );
  const growthSecurityIncrease = ns.growthAnalyzeSecurity(
    baseGrowThreadsNeeded,
    target
  );
  const baseHackWeakenThreadsNeeded = Math.ceil(
    hackSecurityIncrease / weakenPerThread
  );
  const baseGrowWeakenThreadsNeeded = Math.ceil(
    growthSecurityIncrease / weakenPerThread
  );

  let canKeepBatching = true;
  let batchNumber = 0;
  const batches: BatchItem[] = [];

  const batchBuffer = 100;
  const buffer = 40;

  const weakenHackDelay = 0;
  const hackDelay = weakenTime - hackTime - buffer;
  const growDelay = weakenTime - growTime + buffer;
  const growWeakenDelay = buffer * 3;

  while (canKeepBatching) {
    let hackThreadsNeeded = baseHackThreadsNeeded;
    let growThreadsNeeded = baseGrowThreadsNeeded;
    let hackWeakenThreadsNeeded = baseHackWeakenThreadsNeeded;
    let growWeakenThreadsNeeded = baseGrowWeakenThreadsNeeded;

    for (const server of usableServers) {
      let availableRam =
        ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
      const possibleHackThreads = Math.floor(availableRam / hackCost);
      if (hackThreadsNeeded > 0 && possibleHackThreads > 0) {
        const threadsToUse = Math.min(hackThreadsNeeded, possibleHackThreads);
        hackThreadsNeeded -= threadsToUse;
        availableRam -= threadsToUse * hackCost;
        batches.push({
          host: server,
          script: "hack.js",
          threads: threadsToUse,
          delay: hackDelay,
        });
      }

      const possibleGrowThreads = Math.floor(availableRam / growCost);

      if (growThreadsNeeded > 0 && possibleGrowThreads > 0) {
        const threadsToUse = Math.min(growThreadsNeeded, possibleGrowThreads);
        growThreadsNeeded -= threadsToUse;
        availableRam -= threadsToUse * growCost;
        batches.push({
          host: server,
          script: "grow.js",
          threads: threadsToUse,
          delay: growDelay,
        });
      }

      const possibleHackWeakenThreads = Math.floor(availableRam / weakenCost);
      if (hackWeakenThreadsNeeded > 0 && possibleHackWeakenThreads > 0) {
        const threadsToUse = Math.min(
          hackWeakenThreadsNeeded,
          possibleHackWeakenThreads
        );
        hackWeakenThreadsNeeded -= threadsToUse;
        availableRam -= threadsToUse * weakenCost;
        batches.push({
          host: server,
          script: "weaken.js",
          threads: threadsToUse,
          delay: weakenHackDelay,
        });
      }

      const possibleGrowWeakenThreads = Math.floor(availableRam / weakenCost);
      if (growWeakenThreadsNeeded > 0 && possibleGrowWeakenThreads > 0) {
        const threadsToUse = Math.min(
          growWeakenThreadsNeeded,
          possibleGrowWeakenThreads
        );
        growWeakenThreadsNeeded -= threadsToUse;
        availableRam -= threadsToUse * weakenCost;
        batches.push({
          host: server,
          script: "weaken.js",
          threads: threadsToUse,
          delay: growWeakenDelay,
        });
      }
    }

    if (
      hackThreadsNeeded === 0 &&
      growThreadsNeeded === 0 &&
      hackWeakenThreadsNeeded === 0 &&
      growWeakenThreadsNeeded === 0
    ) {
      // run batch
      const start = Math.max(Date.now(), earliestStartTime);
      const batchStartTime = start + batchNumber * batchBuffer;
      batches.forEach((batch) => {
        ns.exec(
          batch.script,
          batch.host,
          batch.threads,
          target,
          batch.delay,
          batchStartTime
        );
      });
    } else {
      canKeepBatching = false;
      ns.write(
        "nextBatchStart.txt",
        (Date.now() + batchNumber * batchBuffer + buffer * 4).toString(),
        "w"
      );
    }
    batchNumber++;
  }
}
