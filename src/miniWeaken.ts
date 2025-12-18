import { NS } from "@ns";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS): Promise<void> {
  const target = ns.read("bestTarget.txt");
  const weakenCost = ns.getScriptRam("weaken.js");
  const usableServers = getUsableServers(ns);

  for (const server of usableServers) {
    const availableRam =
      ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    const threads = Math.floor(availableRam / weakenCost);
    if (threads > 0) {
      ns.exec("weaken.js", server, threads, target);
    }
  }
}
