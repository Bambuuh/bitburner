import { NS } from "@ns";

export function printServers(ns: NS) {
  const servers = ns.getPurchasedServers();
  ns.print("Servers");
  ns.print("----------------------------");
  const ramCounts: Record<number, number> = {};
  servers.forEach((server) => {
    const serverRam = ns.getServerMaxRam(server);
    ramCounts[serverRam] = (ramCounts[serverRam] || 0) + 1;
  });
  ns.print(`Server count: ${servers.length}`);
  Object.keys(ramCounts)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((ram) => {
      ns.print(`${ram}GB: ${ramCounts[ram]}`);
    });
}
