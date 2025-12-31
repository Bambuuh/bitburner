import { NS } from "@ns";

export function printServers(ns: NS) {
  const servers = ns.getPurchasedServers();
  ns.print("Servers");
  ns.print("----------------------------");
  let lowestServerRam = Number.MAX_SAFE_INTEGER;
  let highestServerRam = 0;
  servers.forEach((server) => {
    const serverRam = ns.getServerMaxRam(server);
    if (serverRam < lowestServerRam) {
      lowestServerRam = serverRam;
    }
    if (serverRam > highestServerRam) {
      highestServerRam = serverRam;
    }
  });
  ns.print(`Lowest server RAM: ${lowestServerRam}`);
  ns.print(`Highest server RAM: ${highestServerRam}`);
}
