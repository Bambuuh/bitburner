import { NS } from "@ns";

const hack = "hack.js";
const hackPath = `${hack}`;

export function hackServers(
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

    const minSecurity = ns.getServerMinSecurityLevel(hostName);
    const currentSecurity = ns.getServerSecurityLevel(hostName);

    const currentMoney = ns.getServerMoneyAvailable(hostName);
    const moneyThresh = ns.getServerMaxMoney(hostName) * 0.9;

    const hasMoney = currentMoney >= moneyThresh;
    const isWeak = currentSecurity === minSecurity;

    if (hasMoney && isWeak) {
      let done = false;
      for (let i = 0; i < playerServers.length && done === false; i++) {
        const playerServer = playerServers[i];
        const isRunningScript = ns.getServerUsedRam(playerServer) > 0;

        if (isRunningScript) {
          continue;
        }

        const ramCost = ns.getScriptRam(hackPath);
        const serverRam = ns.getServerMaxRam(playerServer);

        const maxThreads = Math.floor(serverRam / ramCost);

        ns.scp(hackPath, playerServer);
        ns.exec(hack, playerServer, maxThreads, hostName);
        targets.push(hostName);
        done = true;
      }
    }
  }

  return targets;
}
