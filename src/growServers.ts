import { NS } from "@ns";

const grow = "grow.js";
const growPath = `${grow}`;

export function growServers(
  ns: NS,
  servers: string[],
  playerServers: string[],
  targetedServers: string[]
): string[] {
  const targets: string[] = [...targetedServers];
  for (let i = 0; i < servers.length; i++) {
    const hostName = servers[i];

    if (targets.some((server) => server === hostName)) {
      continue;
    }

    const currentMoney = ns.getServerMoneyAvailable(hostName);
    const moneyThresh = ns.getServerMaxMoney(hostName) * 0.9;

    if (currentMoney < moneyThresh) {
      let done = false;
      for (let i = 0; i < playerServers.length && done === false; i++) {
        const playerServer = playerServers[i];
        const isRunningScript = ns.getServerUsedRam(playerServer) > 0;

        if (isRunningScript) {
          continue;
        }

        const ramCost = ns.getScriptRam(growPath);
        const serverRam = ns.getServerMaxRam(playerServer);

        const maxThreads = Math.floor(serverRam / ramCost);

        ns.scp(growPath, playerServer);
        ns.exec(grow, playerServer, maxThreads, hostName);
        targets.push(hostName);
        done = true;
      }
    }
  }

  return targets;
}
