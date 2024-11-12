import { NS } from "@ns";

export function getHackableServers(ns: NS) {
  const visisted = new Set();
  const serversToScan = ["home"];
  const hackableServers = [];
  const player = ns.getPlayer();

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

      if (hasAccess && server !== "home" && !server.startsWith("server-")) {
        hackableServers.push(server);
      } else {
        const canHack =
          ns.getServerRequiredHackingLevel(server) <= player.skills.hacking;

        if (canHack) {
          const ports = ns.getServerNumPortsRequired(server);
          let closedPorts = ports;

          if (hasBrute) {
            ns.brutessh(server);
            closedPorts -= 1;
          }

          if (hasFTP) {
            ns.ftpcrack(server);
            closedPorts -= 1;
          }

          if (hasWorm) {
            ns.httpworm(server);
            closedPorts -= 1;
          }

          if (hasRelay) {
            ns.relaysmtp(server);
            closedPorts -= 1;
          }

          if (hasSQL) {
            ns.sqlinject(server);
            closedPorts -= 1;
          }

          if (closedPorts === 0) {
            ns.nuke(server);
            ns.tprint(`Opened ${server}`);
            hackableServers.push(server);
          }
        }
      }
    }
  }

  return hackableServers;
}
