import { NS, Player } from "@ns";

export function getHackableServers(ns: NS, player: Player) {
  const visisted = new Set();
  const serversToScan = ["home"];
  const hackableServers = [];

  if (ns.hasTorRouter()) {
    ns.singularity.purchaseProgram("BruteSSH.exe");
    ns.singularity.purchaseProgram("FTPCrack.exe");
    ns.singularity.purchaseProgram("HTTPWorm.exe");
    ns.singularity.purchaseProgram("relaySMTP.exe");
    ns.singularity.purchaseProgram("SQLInject.exe");
  } else {
    ns.singularity.purchaseTor();
  }

  const hasBrute = ns.fileExists("BruteSSH.exe", "home");
  const hasFTP = ns.fileExists("FTPCrack.exe", "home");
  const hasWorm = ns.fileExists("HTTPWorm.exe", "home");
  const hasRelay = ns.fileExists("relaySMTP.exe", "home");
  const hasSQL = ns.fileExists("SQLInject.exe", "home");

  while (serversToScan.length > 0) {
    const server = serversToScan.pop();
    if (server !== undefined && !visisted.has(server)) {
      visisted.add(server);
      serversToScan.push(...ns.scan(server));
      const hasAccess = ns.hasRootAccess(server);

      if (hasAccess && isEligableServer(server)) {
        hackableServers.push(server);
      } else if (isEligableServer(server)) {
        const canHack =
          ns.getServerRequiredHackingLevel(server) <= player.skills.hacking;

        if (canHack) {
          const ports = ns.getServerNumPortsRequired(server);
          let closedPorts = ports;

          if (hasBrute) {
            closedPorts -= 1;
            ns.brutessh(server);
          }

          if (hasFTP) {
            closedPorts -= 1;
            ns.ftpcrack(server);
          }

          if (hasWorm) {
            closedPorts -= 1;
            ns.httpworm(server);
          }

          if (hasRelay) {
            closedPorts -= 1;
            ns.relaysmtp(server);
          }

          if (hasSQL) {
            closedPorts -= 1;
            ns.sqlinject(server);
          }

          if (closedPorts <= 0) {
            ns.nuke(server);
            hackableServers.push(server);
          }
        }
      }
    }
  }

  return hackableServers;
}

function isEligableServer(server: string) {
  return (
    server !== "home" && !server.startsWith("server-") && server !== "darkweb"
  );
}
