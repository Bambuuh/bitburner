import { NS } from "@ns";

const weaken = "weaken.js";
const weakenPath = `${weaken}`;

export function weakenServers(
  ns: NS,
  servers: string[],
  playerServers: string[],
  targetedServers: string[]
): string[] {
  const newTargets: string[] = [];
  for (let i = 0; i < servers.length; i++) {
    const hostName = servers[i];

    if (targetedServers.some((server) => server === hostName)) {
      continue;
    }

    const minSecurity = ns.getServerMinSecurityLevel(hostName);
    const currentSecurity = ns.getServerSecurityLevel(hostName);

    if (currentSecurity > minSecurity) {
      let done = false;
      for (let i = 0; i < playerServers.length && done === false; i++) {
        const playerServer = playerServers[i];
        const isRunningScript = ns.getServerUsedRam(playerServer) > 0;

        if (isRunningScript) {
          continue;
        }

        const ramCost = ns.getScriptRam(weakenPath);
        const serverRam = ns.getServerMaxRam(playerServer);
        const maxThreads = Math.floor(serverRam / ramCost);

        ns.scp(weakenPath, playerServer);
        ns.exec(weaken, playerServer, maxThreads, hostName);
        newTargets.push(hostName);
        done = true;
      }
    }
  }

  return newTargets;
}
