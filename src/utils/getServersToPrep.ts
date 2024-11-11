import { NS } from "@ns";

export function getServersToPrep(ns: NS, servers: string[]) {
  return servers.filter((server) => {
    const isMinSec =
      ns.getServerMinSecurityLevel(server) ===
      ns.getServerSecurityLevel(server);

    return !isMinSec;
  });
}
