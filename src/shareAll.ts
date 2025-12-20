import { NS } from "@ns";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS): Promise<void> {
  const servers = getUsableServers(ns);
  const shareCost = ns.getScriptRam("share.js");
  while (true) {
    for (const server of servers) {
      const availableRam =
        ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
      const possibleShareThreads = Math.floor(availableRam / shareCost);
      if (possibleShareThreads > 0) {
        ns.exec("share.js", server, possibleShareThreads);
      }
    }
    await ns.sleep(11000);
  }
}
