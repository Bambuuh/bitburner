import { NS } from "@ns";

export async function main(ns: NS) {
  const player = ns.getPlayer();
  const servers = ns.getPurchasedServers();
  const newServerCost = ns.getPurchasedServerCost(2);
  let money = player.money;
  const serverLimit = ns.getPurchasedServerLimit();
  let serverCount = servers.length;
  const serverList = [...servers];

  if (serverCount < serverLimit) {
    while (money >= newServerCost && serverCount < serverLimit) {
      const name = ns.purchaseServer(
        `server-${serverList.length.toString()}`,
        2
      );
      if (name) {
        serverCount++;
        money -= newServerCost;
        serverList.push(name);
      }
    }
  } else {
    serverList.sort((a, b) => {
      const ramA = ns.getServerMaxRam(a);
      const ramB = ns.getServerMaxRam(b);
      return ramB - ramA;
    });
    serverList.forEach((server) => {
      const maxRam = ns.getServerMaxRam(server);
      let upgradeToRam = 1048576;
      let hasPurchased = false;
      while (upgradeToRam > maxRam && !hasPurchased) {
        hasPurchased = ns.upgradePurchasedServer(server, upgradeToRam);
        upgradeToRam /= 2;
      }
    });
  }
}
