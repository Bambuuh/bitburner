import { NS } from "@ns";

export function tryPurchaseNewServers(ns: NS): void {
  const maxServerCount = ns.getPurchasedServerLimit();
  const playerServers = ns.getPurchasedServers();

  const availableServerCount = maxServerCount - playerServers.length;

  if (availableServerCount > 0) {
    for (let i = 0; i < availableServerCount; i++) {
      const hostname = ns.purchaseServer("server", 2);
      if (hostname.length === 0) {
        return;
      }
      ns.tprint("Purchased new server: ", hostname);
    }
  } else {
    for (let i = 0; i < playerServers.length; i++) {
      const hostName = playerServers[i];
      const maxRam = ns.getServerMaxRam(hostName);
      const success = ns.upgradePurchasedServer(hostName, maxRam * 2);

      if (success) {
        ns.tprint("Upgraded ", playerServers[i], " to ", maxRam * 2);
      }
    }
  }
}
