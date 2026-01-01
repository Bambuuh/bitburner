import { NS } from "@ns";
import { getMockServer } from "./getMockServer";
import { getUsableServers } from "./getUsableServers";

type Operation = "hack" | "grow" | "hackWeaken" | "growWeaken";

type BatchItem = {
  host: string;
  script: string;
  threads: number;
  operation: Operation;
};

export async function main(ns: NS): Promise<void> {
  const obj = ns.read("batchTarget.json");
  const previousBatchEnd = ns.read("nextBatchEnd.txt");
  const earliestStartTime = previousBatchEnd
    ? parseInt(previousBatchEnd, 10) + 40
    : 0;

  if (!obj) {
    return;
  }

  const { target, multiplier } = JSON.parse(obj);

  const mockServer = getMockServer(ns, target);
  const player = ns.getPlayer();

  const usableServers = getUsableServers(ns);

  const weakenCost = ns.getScriptRam("weaken.js");
  const hackCost = ns.getScriptRam("hack.js");
  const growCost = ns.getScriptRam("grow.js");
  const weakenTime = ns.formulas.hacking.weakenTime(mockServer, player);

  const weakenPerThread = ns.weakenAnalyze(1);

  const hackPercentPerThread = ns.formulas.hacking.hackPercent(
    mockServer,
    player
  );

  const mockHackedServer = getMockServer(ns, target, {
    hackedMoneyMult: multiplier,
  });

  const baseHackThreadsNeeded = Math.max(
    1,
    Math.floor(multiplier / hackPercentPerThread)
  );
  const baseGrowThreadsNeeded = Math.ceil(
    ns.formulas.hacking.growThreads(
      mockHackedServer,
      player,
      mockHackedServer.moneyMax ?? 1
    )
  );
  const hackSecurityIncrease = ns.hackAnalyzeSecurity(baseHackThreadsNeeded);
  const growthSecurityIncrease = ns.growthAnalyzeSecurity(
    baseGrowThreadsNeeded
  );
  const baseHackWeakenThreadsNeeded = Math.ceil(
    hackSecurityIncrease / weakenPerThread
  );
  const baseGrowWeakenThreadsNeeded = Math.ceil(
    growthSecurityIncrease / weakenPerThread
  );

  let canKeepBatching = true;
  let batchNumber = 0;
  let lastBatchEndTime = 0;

  const buffer = 40;
  const batchBuffer = buffer * 4;

  while (canKeepBatching) {
    let hackThreadsNeeded = baseHackThreadsNeeded;
    let growThreadsNeeded = baseGrowThreadsNeeded;
    let hackWeakenThreadsNeeded = baseHackWeakenThreadsNeeded;
    let growWeakenThreadsNeeded = baseGrowWeakenThreadsNeeded;
    const currentBatch: BatchItem[] = [];

    for (const server of usableServers) {
      let availableRam =
        ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
      const possibleHackThreads = Math.floor(availableRam / hackCost);
      if (hackThreadsNeeded > 0 && possibleHackThreads > 0) {
        const threadsToUse = Math.min(hackThreadsNeeded, possibleHackThreads);
        hackThreadsNeeded -= threadsToUse;
        availableRam -= threadsToUse * hackCost;
        currentBatch.push({
          host: server,
          script: "hack.js",
          threads: threadsToUse,
          operation: "hack",
        });
      }

      const possibleGrowThreads = Math.floor(availableRam / growCost);

      if (growThreadsNeeded > 0 && possibleGrowThreads > 0) {
        const threadsToUse = Math.min(growThreadsNeeded, possibleGrowThreads);
        growThreadsNeeded -= threadsToUse;
        availableRam -= threadsToUse * growCost;
        currentBatch.push({
          host: server,
          script: "grow.js",
          threads: threadsToUse,
          operation: "grow",
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
        currentBatch.push({
          host: server,
          script: "weaken.js",
          threads: threadsToUse,
          operation: "hackWeaken",
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
        currentBatch.push({
          host: server,
          script: "weaken.js",
          threads: threadsToUse,
          operation: "growWeaken",
        });
      }

      if (
        hackThreadsNeeded === 0 &&
        growThreadsNeeded === 0 &&
        hackWeakenThreadsNeeded === 0 &&
        growWeakenThreadsNeeded === 0
      ) {
        break;
      }
    }

    if (
      hackThreadsNeeded === 0 &&
      growThreadsNeeded === 0 &&
      hackWeakenThreadsNeeded === 0 &&
      growWeakenThreadsNeeded === 0
    ) {
      const start = Math.max(Date.now(), earliestStartTime);
      const batchStartTime = start + batchNumber * batchBuffer;
      const hackWeakenLandTime = batchStartTime + weakenTime;
      const hackLandTime = hackWeakenLandTime - buffer;
      const growLandTime = hackWeakenLandTime + buffer;
      const growWeakenLandTime = growLandTime + buffer;

      const landTimes: Record<Operation, number> = {
        hack: hackLandTime,
        grow: growLandTime,
        hackWeaken: hackWeakenLandTime,
        growWeaken: growWeakenLandTime,
      };

      currentBatch.forEach((batch) => {
        ns.exec(
          batch.script,
          batch.host,
          batch.threads,
          target,
          landTimes[batch.operation]
        );
      });

      lastBatchEndTime = growWeakenLandTime;
    } else {
      canKeepBatching = false;
    }
    batchNumber++;
  }

  if (lastBatchEndTime > 0) {
    ns.write("nextBatchEnd.txt", lastBatchEndTime.toString(), "w");
  }
}
