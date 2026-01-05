import { NS } from "@ns";
import { canBatch } from "./canBatchFn";
import { getMockServer } from "./getMockServer";
import { getUsableServers } from "./getUsableServers";

type ScriptRun = {
  script: string;
  server: string;
  threads: number;
  target: string;
  additionalMsec: number;
};

export function batchTargetValue(ns: NS, target: string) {
  const batchData = canBatch(ns, target);

  if (!batchData) {
    return { server: target, score: 0 };
  }

  const data: BatchData = batchData;

  const servers = getUsableServers(ns);

  const mockServer = getMockServer(ns, target);
  const hackCost = ns.getScriptRam("hack.js");
  const weakenCost = ns.getScriptRam("weaken.js");
  const growCost = ns.getScriptRam("grow.js");

  const player = ns.getPlayer();
  const weakenTime = ns.formulas.hacking.weakenTime(mockServer, player);
  const growTime = ns.formulas.hacking.growTime(mockServer, player);
  const hackTime = ns.formulas.hacking.hackTime(mockServer, player);
  const weakenEffect = ns.weakenAnalyze(1);
  const hackPercentPerThread = ns.formulas.hacking.hackPercent(
    mockServer,
    player
  );

  const hackThreads = Math.floor(data.multiplier / hackPercentPerThread);

  const hackSecurity = ns.hackAnalyzeSecurity(hackThreads);
  const weakenHackThreads = Math.ceil((hackSecurity / weakenEffect) * 1.2);

  const hackPercent =
    ns.formulas.hacking.hackPercent(mockServer, player) * hackThreads;
  const hackedServer = {
    ...mockServer,
    moneyAvailable: (mockServer.moneyMax ?? 1) * (1 - hackPercent),
  };
  const growThreads = Math.ceil(
    ns.formulas.hacking.growThreads(
      hackedServer,
      player,
      mockServer.moneyMax!
    ) * 1.2
  );
  const growSecurity = ns.growthAnalyzeSecurity(growThreads);
  const weakenGrowthThreads = Math.ceil((growSecurity / weakenEffect) * 1.2);

  const batches: ScriptRun[][] = [];
  const batch: ScriptRun[] = [];

  const usableServers = servers.map((server) => ({
    name: server,
    availableRam: ns.getServerMaxRam(server) - ns.getServerUsedRam(server),
  }));

  let canRunMore = true;

  // TODO: RETHINK, check if server can run ALL hack, if not, exit. if yes, spread out hack weaken.
  // then check if a server can run ALL GROW, if not, exit. if yes, spread out grow weaken.

  while (canRunMore) {
    let hackThreadsRemaining = hackThreads;
    let weakenHackThreadsRemaining = weakenHackThreads;
    let growThreadsRemaining = growThreads;
    let weakenGrowthThreadsRemaining = weakenGrowthThreads;

    if (hackThreadsRemaining > 0) {
      for (const server of usableServers) {
        const possibleHackThreads = Math.min(
          Math.floor(server.availableRam / hackCost),
          hackThreadsRemaining
        );
        const canRunAllHackThreads = possibleHackThreads >= hackThreads;
        if (possibleHackThreads > 0 && canRunAllHackThreads) {
          batch.push({
            script: "hack.js",
            server: server.name,
            threads: possibleHackThreads,
            target,
            additionalMsec: weakenTime - hackTime,
          });
          hackThreadsRemaining -= possibleHackThreads;
          server.availableRam -= possibleHackThreads * hackCost;
          break;
        }
      }
    }

    if (weakenHackThreadsRemaining > 0) {
      for (const server of usableServers) {
        const possibleWeakenHackThreads = Math.min(
          Math.floor(server.availableRam / weakenCost),
          weakenHackThreadsRemaining
        );
        if (possibleWeakenHackThreads >= 1) {
          batch.push({
            script: "weaken.js",
            server: server.name,
            threads: possibleWeakenHackThreads,
            target,
            additionalMsec: 0,
          });
          weakenHackThreadsRemaining -= possibleWeakenHackThreads;
          server.availableRam -= possibleWeakenHackThreads * weakenCost;
        }

        if (weakenHackThreadsRemaining <= 0) {
          break;
        }
      }
    }

    if (growThreadsRemaining > 0) {
      for (const server of usableServers) {
        const possibleGrowThreads = Math.min(
          Math.floor(server.availableRam / growCost),
          growThreadsRemaining
        );
        const canRunAllGrowThreads = possibleGrowThreads >= growThreads;
        if (possibleGrowThreads > 0 && canRunAllGrowThreads) {
          batch.push({
            script: "grow.js",
            server: server.name,
            threads: possibleGrowThreads,
            target,
            additionalMsec: weakenTime - growTime,
          });
          growThreadsRemaining -= possibleGrowThreads;
          server.availableRam -= possibleGrowThreads * growCost;
          break;
        }
      }
    }

    if (weakenGrowthThreadsRemaining > 0) {
      for (const server of usableServers) {
        const possibleWeakenGrowthThreads = Math.min(
          Math.floor(server.availableRam / weakenCost),
          weakenGrowthThreadsRemaining
        );
        if (possibleWeakenGrowthThreads >= 1) {
          batch.push({
            script: "weaken.js",
            server: server.name,
            threads: possibleWeakenGrowthThreads,
            target,
            additionalMsec: 0,
          });
          weakenGrowthThreadsRemaining -= possibleWeakenGrowthThreads;
          server.availableRam -= possibleWeakenGrowthThreads * weakenCost;
        }

        if (weakenGrowthThreadsRemaining <= 0) {
          break;
        }
      }
    }

    if (
      hackThreadsRemaining <= 0 &&
      weakenHackThreadsRemaining <= 0 &&
      growThreadsRemaining <= 0 &&
      weakenGrowthThreadsRemaining <= 0
    ) {
      batches.push([...batch]);
      batch.length = 0;
    } else {
      canRunMore = false;
    }
  }

  const moneyPerBatch = (mockServer.moneyMax ?? 0) * data.multiplier;
  const weakenTimeInSeconds = weakenTime / 1000;
  const moneyPerSecondPerBatch = moneyPerBatch / weakenTimeInSeconds;

  const totalMoneyPerSecond = batches.length * moneyPerSecondPerBatch;

  return {
    server: data.target,
    score: totalMoneyPerSecond,
  };
}
