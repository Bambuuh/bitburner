import { NS } from "@ns";
import { WEAKEN_SEC } from "./constants";

export function weakenAllServers(
  ns: NS,
  playerServers: string[],
  serversToWeaken: string[]
): string[] {
  const weakening: string[] = [];

  for (let i = 0; i < serversToWeaken.length; i++) {
    const target = serversToWeaken[i];
    const minSec = ns.getServerMinSecurityLevel(target);
    const currSec = ns.getServerSecurityLevel(target);

    if (currSec > minSec) {
      const missingSec = currSec - minSec;
      const threadsRequired = Math.ceil(missingSec / WEAKEN_SEC);
      const scriptRamCost = ns.getScriptRam("weaken.js");
      const totalRamCost = threadsRequired * scriptRamCost;

      const usableServer = playerServers.find(
        (server) =>
          ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >
          totalRamCost
      );

      if (usableServer) {
        ns.exec("weaken.js", usableServer, threadsRequired, target, 0, true);
        weakening.push(target);
        ns.tprint("Prepping ", target);
      }
    }
  }

  return weakening;
}
