import { NS } from "@ns";

export function getUsableServers(ns: NS) {
  const visisted = new Set();
  const serversToScan = ["home"];
  const hackableServers = [];

  while (serversToScan.length > 0) {
    const server = serversToScan.pop();
    if (server !== undefined && !visisted.has(server)) {
      visisted.add(server);
      serversToScan.push(...ns.scan(server));
      const hasAccess = ns.hasRootAccess(server);

      if (hasAccess && server !== "darkweb") {
        hackableServers.push(server);
      }
    }
  }

  return hackableServers;
}
