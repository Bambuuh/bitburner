import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const servers = ns.getPurchasedServers();
  const player = ns.getPlayer();
  const newServerCost = ns.getPurchasedServerCost(8);
  let money = player.money;
  let serverCount = servers.length;

  ns.tprint(money);
  ns.tprint(newServerCost);

  if (serverCount < 8) {
    while (money > newServerCost) {
      purchaseNewServer(`server-${servers.length.toString()}`);
      serverCount++;
      ns.tprint(`Purchased new server, new count ${serverCount}`);
      money -= newServerCost;
    }
  }

  function purchaseNewServer(serverName: string) {
    ns.purchaseServer(serverName, 8);
  }
}
