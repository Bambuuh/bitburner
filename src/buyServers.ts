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
        addScripts(ns, name);
        serverCount++;
        ns.tprint(`Purchased new server, new count ${serverCount}`);
        money -= newServerCost;
        serverList.push(name);
      }
    }
  } else {
    serverList.forEach((server) => {
      const maxRam = ns.getServerMaxRam(server);
      const didUpgrade = ns.upgradePurchasedServer(server, maxRam * 2);
      if (didUpgrade) {
        ns.tprint(`Upgraded ${server} to ${maxRam * 2} RAM`);
      }
    });
  }
}

function addScripts(ns: NS, server: string) {
  const scripts = ["hack.js", "grow.js", "weaken.js"];

  for (const script of scripts) {
    ns.scp(script, server);
  }
}
