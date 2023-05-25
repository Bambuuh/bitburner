import { NS } from "@ns";
import { tryPurchaseNewServers } from "./tryPurchaseNewServers";

export async function main(ns: NS): Promise<void> {
  const target = "n00dles";
  const hackScriptCost = ns.getScriptRam("hack.js");
  const weakenScriptCost = ns.getScriptRam("weaken.js");
  const growScriptCost = ns.getScriptRam("grow.js");

  while (true) {
    const sec = ns.getServerSecurityLevel(target);
    const minSec = ns.getServerMinSecurityLevel(target);

    const money = ns.getServerMoneyAvailable(target);
    const maxMoney = ns.getServerMaxMoney(target);

    const playerServers = ns.getPurchasedServers();

    if (playerServers.length === 0) {
      ns.purchaseServer("server", 4);
    }

    const serverRam = ns.getServerMaxRam("server");

    if (playerServers.some((server) => ns.getServerMaxRam(server) > 32)) {
      tryPurchaseNewServers(ns);
    } else {
      ns.upgradePurchasedServer("server", serverRam * 2);
    }

    playerServers.push("home");

    playerServers.forEach((server) => {
      if (!ns.fileExists("weaken.js", server)) {
        ns.scp("weaken.js", server);
        ns.scp("hack.js", server);
        ns.scp("grow.js", server);
      }

      const availableRam = Math.floor(
        ns.getServerMaxRam(server) - ns.getServerUsedRam(server)
      );

      if (sec > minSec) {
        const threads = Math.floor(availableRam / weakenScriptCost);
        if (threads > 0) {
          ns.exec("weaken.js", server, threads, target);
        }
      } else if (money < maxMoney) {
        const threads = Math.floor(availableRam / growScriptCost);
        if (threads > 0) {
          ns.exec("grow.js", server, threads, target);
        }
      } else {
        const threads = Math.floor(availableRam / hackScriptCost);
        if (threads > 0) {
          ns.exec("hack.js", server, threads, target);
        }
      }
    });

    await ns.sleep(1000);
  }
}

// export async function main(ns: NS): Promise<void> {
//   const server = "n00dles";

//   ns.tprint("RUNNING");

//   while (true) {
//     await ns.weaken(server);
//     await ns.grow(server);
//     await ns.weaken(server);
//     await ns.hack(server);
//   }
// }
