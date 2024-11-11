import { NS } from "@ns";

export function getServersToPrep(ns: NS, servers: string[]) {
  return servers.filter((server) => {
    const isMinSec =
      ns.getServerMinSecurityLevel(server) ===
      ns.getServerSecurityLevel(server);
    const isMaxMoney =
      ns.getServerMaxMoney(server) === ns.getServerMoneyAvailable(server);

    return !isMinSec || !isMaxMoney;
  });
}
