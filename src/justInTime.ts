import { NS } from "@ns";
import { getMockServer } from "./getMockServer";
import { getUsableServers } from "./getUsableServers";

type ScriptRun = {
  script: string;
  server: string;
  threads: number;
  target: string;
  additionalMsec: number;
};

export async function main(ns: NS): Promise<void> {
  const obj = ns.read("batchTarget.json");
  if (!obj) {
    ns.tprint("No batch target found");
    return;
  }
  const data: BatchData = JSON.parse(obj);
  const target = data.target;
  ns.tprint(`Target: ${target}`);

  const servers = getUsableServers(ns);

  const mockServer = getMockServer(ns, target);
  const hackCost = ns.getScriptRam("hack.js");
  const weakenCost = ns.getScriptRam("weaken.js");
  const growCost = ns.getScriptRam("grow.js");

  // while (true) {
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
  const weakenHackThreads = Math.ceil((hackSecurity / weakenEffect) * 1.1);

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
    ) * 1.1
  );
  const growSecurity = ns.growthAnalyzeSecurity(growThreads);
  const weakenGrowthThreads = Math.ceil((growSecurity / weakenEffect) * 1.1);

  let counter = 0;

  const batches: ScriptRun[][] = [];
  const batch: ScriptRun[] = [];

  const usableServers = servers.map((server) => ({
    name: server,
    availableRam: ns.getServerMaxRam(server) - ns.getServerUsedRam(server),
  }));

  let canRunMore = true;

  while (canRunMore) {
    let hackThreadsRemaining = hackThreads;
    let weakenHackThreadsRemaining = weakenHackThreads;
    let growThreadsRemaining = growThreads;
    let weakenGrowthThreadsRemaining = weakenGrowthThreads;
    for (const server of usableServers) {
      let canServerRunMore = true;

      while (canServerRunMore) {
        const possibleHackThreads = Math.min(
          Math.floor(server.availableRam / hackCost),
          hackThreadsRemaining
        );
        if (possibleHackThreads >= 1) {
          batch.push({
            script: "hack.js",
            server: server.name,
            threads: possibleHackThreads,
            target,
            additionalMsec: weakenTime - hackTime,
          });
          hackThreadsRemaining -= possibleHackThreads;
          server.availableRam -= possibleHackThreads * hackCost;
        }

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

        const possibleGrowThreads = Math.min(
          Math.floor(server.availableRam / growCost),
          growThreadsRemaining
        );
        if (possibleGrowThreads >= 1) {
          batch.push({
            script: "grow.js",
            server: server.name,
            threads: possibleGrowThreads,
            target,
            additionalMsec: weakenTime - growTime,
          });
          growThreadsRemaining -= possibleGrowThreads;
          server.availableRam -= possibleGrowThreads * growCost;
        }

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

        const batchComplete =
          hackThreadsRemaining === 0 &&
          weakenHackThreadsRemaining === 0 &&
          growThreadsRemaining === 0 &&
          weakenGrowthThreadsRemaining === 0;

        const batchIncomplete =
          hackThreadsRemaining > 0 ||
          weakenHackThreadsRemaining > 0 ||
          growThreadsRemaining > 0 ||
          weakenGrowthThreadsRemaining > 0;

        const outOfRam =
          possibleHackThreads === 0 &&
          possibleWeakenHackThreads === 0 &&
          possibleGrowThreads === 0 &&
          possibleWeakenGrowthThreads === 0;

        if (batchComplete) {
          canServerRunMore = false;
          batches.push([...batch]);
          counter++;
          batch.length = 0;
        } else if (batchIncomplete || outOfRam) {
          canServerRunMore = false;
        }
      }
    }

    if (
      hackThreadsRemaining > 0 ||
      weakenHackThreadsRemaining > 0 ||
      growThreadsRemaining > 0 ||
      weakenGrowthThreadsRemaining > 0
    ) {
      canRunMore = false;
    }
  }

  batches.forEach((batch) => {
    batch.forEach((script) => {
      ns.exec(
        script.script,
        script.server,
        script.threads,
        script.target,
        script.additionalMsec
      );
    });
  });

  ns.tprint(`Executed ${counter} cycles`);
  // await ns.sleep(weakenTime + 100);
  const server = ns.getServer(target);
  ns.tprint(
    `Server ${target}: money=${server.moneyAvailable}, security=${server.hackDifficulty}`
  );
  // }
}
