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
  const parsedPreviousBatchEnd = previousBatchEnd
    ? parseInt(previousBatchEnd, 10)
    : 0;

  // Wait for previous batches to finish before scheduling new ones
  if (parsedPreviousBatchEnd > Date.now()) {
    return;
  }

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
  const hackTime = ns.formulas.hacking.hackTime(mockServer, player);
  const growTime = ns.formulas.hacking.growTime(mockServer, player);

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
    ) * 1.1
  );
  const hackSecurityIncrease = ns.hackAnalyzeSecurity(baseHackThreadsNeeded);
  const growthSecurityIncrease = ns.growthAnalyzeSecurity(
    baseGrowThreadsNeeded
  );
  const baseHackWeakenThreadsNeeded = Math.ceil(
    (hackSecurityIncrease / weakenPerThread) * 1.1
  );
  const baseGrowWeakenThreadsNeeded = Math.ceil(
    (growthSecurityIncrease / weakenPerThread) * 1.1
  );

  let canKeepBatching = true;
  let lastBatchEndTime = 0;

  const buffer = 40;

  const batches: BatchItem[][] = [];

  const servers = usableServers.map((server) => ({
    name: server,
    availableRam: ns.getServerMaxRam(server) - ns.getServerUsedRam(server),
  }));

  while (canKeepBatching) {
    let hackThreadsNeeded = baseHackThreadsNeeded;
    let growThreadsNeeded = baseGrowThreadsNeeded;
    let hackWeakenThreadsNeeded = baseHackWeakenThreadsNeeded;
    let growWeakenThreadsNeeded = baseGrowWeakenThreadsNeeded;
    const currentBatch: BatchItem[] = [];

    for (const server of servers) {
      const possibleHackThreads = Math.floor(server.availableRam / hackCost);
      if (hackThreadsNeeded > 0 && possibleHackThreads > 0) {
        const threadsToUse = Math.min(hackThreadsNeeded, possibleHackThreads);
        hackThreadsNeeded -= threadsToUse;
        server.availableRam -= threadsToUse * hackCost;
        currentBatch.push({
          host: server.name,
          script: "hack.js",
          threads: threadsToUse,
          operation: "hack",
        });
      }

      const possibleHackWeakenThreads = Math.floor(
        server.availableRam / weakenCost
      );
      if (hackWeakenThreadsNeeded > 0 && possibleHackWeakenThreads > 0) {
        const threadsToUse = Math.min(
          hackWeakenThreadsNeeded,
          possibleHackWeakenThreads
        );
        hackWeakenThreadsNeeded -= threadsToUse;
        server.availableRam -= threadsToUse * weakenCost;
        currentBatch.push({
          host: server.name,
          script: "weaken.js",
          threads: threadsToUse,
          operation: "hackWeaken",
        });
      }

      const possibleGrowThreads = Math.floor(server.availableRam / growCost);
      if (growThreadsNeeded > 0 && possibleGrowThreads > 0) {
        const threadsToUse = Math.min(growThreadsNeeded, possibleGrowThreads);
        growThreadsNeeded -= threadsToUse;
        server.availableRam -= threadsToUse * growCost;
        currentBatch.push({
          host: server.name,
          script: "grow.js",
          threads: threadsToUse,
          operation: "grow",
        });
      }

      const possibleGrowWeakenThreads = Math.floor(
        server.availableRam / weakenCost
      );
      if (growWeakenThreadsNeeded > 0 && possibleGrowWeakenThreads > 0) {
        const threadsToUse = Math.min(
          growWeakenThreadsNeeded,
          possibleGrowWeakenThreads
        );
        growWeakenThreadsNeeded -= threadsToUse;
        server.availableRam -= threadsToUse * weakenCost;
        currentBatch.push({
          host: server.name,
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
        batches.push([...currentBatch]);
        break;
      } else {
        canKeepBatching = false;
      }
    }
  }

  if (batches.length > 0) {
    const landTime = Date.now() + weakenTime + buffer;

    const additionlMsec: Record<Operation, number> = {
      hack: weakenTime - hackTime,
      grow: weakenTime - growTime,
      hackWeaken: 0,
      growWeaken: 0,
    };

    batches.forEach((batchList) => {
      batchList.forEach((batch) => {
        ns.exec(
          batch.script,
          batch.host,
          batch.threads,
          target,
          additionlMsec[batch.operation]
        );
      });
    });

    lastBatchEndTime = landTime;
  }

  if (lastBatchEndTime > 0) {
    ns.write("nextBatchEnd.txt", lastBatchEndTime.toString(), "w");
  }
}
