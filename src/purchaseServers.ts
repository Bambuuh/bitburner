import { NS } from "@ns";

export function purchaseServers(ns: NS) {
  const servers = ns.getPurchasedServers();
  const player = ns.getPlayer();
  const newServerCost = ns.getPurchasedServerCost(64);
  let money = player.money;
  const serverLimit = ns.getPurchasedServerLimit();
  let serverCount = servers.length;

  if (serverCount < serverLimit) {
    while (money > newServerCost && serverCount < serverLimit) {
      ns.purchaseServer(`server-${servers.length.toString()}`, 64);
      serverCount++;
      ns.tprint(`Purchased new server, new count ${serverCount}`);
      money -= newServerCost;
    }
  } else {
    servers.forEach((server) => {
      const maxRam = ns.getServerMaxRam(server);
      const didUpgrade = ns.upgradePurchasedServer(server, maxRam * 2);
      if (didUpgrade) {
        ns.tprint(`Upgraded ${server} to ${maxRam * 2} RAM`);
      }
    });
  }
}
