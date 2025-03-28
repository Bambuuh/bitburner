import { NS, Player } from "@ns";

export function beginnerManageServers(
  ns: NS,
  player: Player,
  servers: string[]
) {
  const newServerCost = ns.getPurchasedServerCost(8);
  let money = player.money;
  const serverLimit = ns.getPurchasedServerLimit();
  let serverCount = servers.length;

  if (serverCount < serverLimit) {
    while (money >= newServerCost && serverCount < serverLimit) {
      const name = ns.purchaseServer(`server-${servers.length.toString()}`, 8);
      if (name) {
        addScripts(ns, name);
        ns.exec("trimmedBeginner.js", name);
        serverCount++;
        ns.tprint(`Purchased new server, new count ${serverCount}`);
        money -= newServerCost;
      }
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

function addScripts(ns: NS, server: string) {
  const scripts = ["hack.js", "grow.js", "weaken.js", "trimmedBeginner.js"];

  for (const script of scripts) {
    ns.scp(script, server);
  }
}
