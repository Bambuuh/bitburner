import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const servers = ns.getPurchasedServers();
  const player = ns.getPlayer();
  let money = player.money;

  servers.forEach((server) => {
    const ram = ns.getServerMaxRam(server);
    const newRam = ram * 2;
    const newServerCost = ns.getPurchasedServerCost(newRam);
    if (money > newServerCost) {
      ns.upgradePurchasedServer(server, newRam);
      ns.tprint(`Upgraded ${server} to ${newRam} RAM`);
      money -= newServerCost;
    }
  });
}
