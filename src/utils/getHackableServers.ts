import { NS } from "@ns";

export function getHackableServers(ns: NS) {
  const visisted = new Set();
  const serversToScan = ["home"];
  const hackableServers = [];
  const player = ns.getPlayer();

  const hasBrute = ns.fileExists("BruteSSH.exe", "home");

  while (serversToScan.length > 0) {
    const server = serversToScan.pop();
    if (server !== undefined && !visisted.has(server)) {
      visisted.add(server);
      serversToScan.push(...ns.scan(server));
      const hasAccess = ns.hasRootAccess(server);

      if (hasAccess && server !== "home") {
        hackableServers.push(server);
      } else {
        const canHack =
          ns.getServerRequiredHackingLevel(server) <= player.exp.hacking;

        if (canHack) {
          const ports = ns.getServerNumPortsRequired(server);
          let closedPorts = ports;

          if (hasBrute) {
            ns.brutessh(server);
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
