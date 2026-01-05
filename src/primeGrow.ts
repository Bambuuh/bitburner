import { NS } from "../NetscriptDefinitions";
import { getMockServer } from "./getMockServer";
import { getUsableServers } from "./getUsableServers";

type ScriptRun = {
  script: string;
  threads: number;
  server: string;
  additionalMsec: number;
};

export async function primeGrow(ns: NS, target: string) {
  const maxMoney = ns.getServerMaxMoney(target);
  const currentMoney = Math.floor(ns.getServerMoneyAvailable(target));
  const weakenTime = ns.getWeakenTime(target);
  const growTime = ns.getGrowTime(target);
  const weakenEffect = ns.weakenAnalyze(1);
  const servers = getUsableServers(ns);

  const weakenCost = ns.getScriptRam("weaken.js");
  const growCost = ns.getScriptRam("grow.js");
  const weakenTimeMs = ns.getWeakenTime(target);
  const growTimeMs = ns.getGrowTime(target);

  const mockServer = getMockServer(ns, target);
  mockServer.moneyAvailable = currentMoney;
  mockServer.moneyMax = maxMoney;

  const maxGrowThreads = Math.ceil(
    ns.formulas.hacking.growThreads(mockServer, ns.getPlayer(), maxMoney)
  );

  let baseGrowThreadsRequired = 1;

  let highestPossibleRun: ScriptRun[] = [];
  let currentRun: ScriptRun[] = [];

  let canGoHigher = true;

  while (canGoHigher) {
    let growThreadsRequired = baseGrowThreadsRequired;
    const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreadsRequired);
    let weakenThreadsRequired = Math.ceil(growSecurityIncrease / weakenEffect);
    const additionalWeaken = Math.ceil(weakenThreadsRequired * 0.1);
    weakenThreadsRequired += additionalWeaken;

    for (const server of servers) {
      const maxRam = ns.getServerMaxRam(server);
      const usedRam = ns.getServerUsedRam(server);
      let availableRam = maxRam - usedRam;

      const possibleGrowThreads = Math.min(
        growThreadsRequired,
        Math.floor(availableRam / growCost)
      );

      const growRamCost = possibleGrowThreads * growCost;

      if (possibleGrowThreads > 0) {
        currentRun.push({
          script: "grow.js",
          threads: possibleGrowThreads,
          server: server,
          additionalMsec: weakenTimeMs - growTimeMs,
        });
        growThreadsRequired -= possibleGrowThreads;
        availableRam -= growRamCost;
      }

      const possibleWeakenThreads = Math.min(
        weakenThreadsRequired,
        Math.floor(availableRam / weakenCost)
      );

      if (possibleWeakenThreads > 0) {
        currentRun.push({
          script: "weaken.js",
          threads: possibleWeakenThreads,
          server: server,
          additionalMsec: 0,
        });
        weakenThreadsRequired -= possibleWeakenThreads;
      }

      if (growThreadsRequired <= 0 && weakenThreadsRequired <= 0) {
        break;
      }
    }

    if (growThreadsRequired <= 0 && weakenThreadsRequired <= 0) {
      highestPossibleRun = [...currentRun];
      currentRun = [];

      if (baseGrowThreadsRequired >= maxGrowThreads) {
        canGoHigher = false;
      }
      baseGrowThreadsRequired++;
    } else {
      canGoHigher = false;
    }
  }

  highestPossibleRun.forEach((script) => {
    ns.exec(
      script.script,
      script.server,
      script.threads,
      target,
      script.additionalMsec
    );
  });

  const primeData: PrimeData = {
    endTime: Date.now() + weakenTime + 100,
    status: "growing",
    target,
  };
  const primeDataStr = JSON.stringify(primeData);
  ns.write("primeTargetData.json", primeDataStr, "w");
}
