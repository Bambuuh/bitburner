import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const playerServers = ["home"];
  playerServers.push(...ns.getPurchasedServers());

  const weakenScriptCost = ns.getScriptRam("weaken.js");

  while (true) {
    for (let i = 0; i < playerServers.length; i++) {
      const server = playerServers[i];
      const ramAvailable =
        ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
      const maxThreads = Math.floor(ramAvailable / weakenScriptCost);
      if (maxThreads > 0) {
        ns.exec("weaken.js", server, maxThreads, "joesguns", 0, false);
      }
    }

    await ns.sleep(1000);
  }
}
