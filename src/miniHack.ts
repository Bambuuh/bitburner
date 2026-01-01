import { NS } from "@ns";
import { getMockServer } from "./getMockServer";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS): Promise<void> {
  // const target = ns.read("bestTarget.txt");
  const target = "n00dles";
  const hackCost = ns.getScriptRam("hack.js");
  const weakenCost = ns.getScriptRam("weaken.js");

  const mockServer = getMockServer(ns, target);

  const weakenTime = ns.formulas.hacking.weakenTime(mockServer, ns.getPlayer());
  const hackTime = ns.formulas.hacking.hackTime(mockServer, ns.getPlayer());
  const usableServers = getUsableServers(ns);

  let isTesting = true;
  let hackThreads = 1;
  let highestPossible = {
    hackThreads: 0,
    weakenThreads: 0,
  };

  const hackSecurityIncreasePerThread = ns.hackAnalyzeSecurity(1);
  const weakenPerThread = ns.weakenAnalyze(1);

  while (isTesting) {
    const weakenThreadsNeeded = Math.ceil(
      (hackThreads * hackSecurityIncreasePerThread) / weakenPerThread
    );
    let weakenRemaining = weakenThreadsNeeded;
    let hackThreadsRemaining = hackThreads;

    for (const server of usableServers) {
      let availableRam =
        ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
      const possibleHackThreads = Math.floor(availableRam / hackCost);
      if (hackThreadsRemaining > 0 && possibleHackThreads > 0) {
        const threadsToUse = Math.min(
          hackThreadsRemaining,
          possibleHackThreads
        );
        hackThreadsRemaining -= threadsToUse;
        availableRam -= threadsToUse * hackCost;
      }
      const possibleWeakenThreads = Math.floor(availableRam / weakenCost);
      if (weakenRemaining > 0 && possibleWeakenThreads > 0) {
        const threadsToUse = Math.min(weakenRemaining, possibleWeakenThreads);
        weakenRemaining -= threadsToUse;
      }
      if (weakenRemaining <= 0 && hackThreadsRemaining <= 0) {
        break;
      }
    }

    if (hackThreadsRemaining <= 0 && weakenRemaining <= 0) {
      highestPossible = {
        hackThreads,
        weakenThreads: weakenThreadsNeeded,
      };

      const newHackThreads = hackThreads + 1;
      hackThreads = Math.min(newHackThreads);
    } else {
      isTesting = false;
    }
  }

  if (highestPossible.hackThreads > 0) {
    let hackRemaining = highestPossible.hackThreads;
    let weakenRemaining = highestPossible.weakenThreads;

    const hackStartTime = Date.now() + weakenTime - hackTime - 40;
    const weakenStartTIme = Date.now();

    for (const server of usableServers) {
      let availableRam =
        ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
      const possibleHackThreads = Math.floor(availableRam / hackCost);
      if (hackRemaining > 0 && possibleHackThreads > 0) {
        const threadsToUse = Math.min(hackRemaining, possibleHackThreads);
        ns.exec("hack.js", server, threadsToUse, target, 0, hackStartTime);
        hackRemaining -= threadsToUse;
        availableRam -= threadsToUse * hackCost;
      }
      const possibleWeakenThreads = Math.floor(availableRam / weakenCost);
      if (weakenRemaining > 0 && possibleWeakenThreads > 0) {
        const threadsToUse = Math.min(weakenRemaining, possibleWeakenThreads);
        ns.exec("weaken.js", server, threadsToUse, target, 0, weakenStartTIme);
        weakenRemaining -= threadsToUse;
      }
      // if (weakenRemaining <= 0 && growRemaining <= 0) {
      //   primeEndTime = Date.now() + weakenTime + 100;
      //   break;
      // }
    }
  }
}
