import { NS } from "@ns";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS): Promise<void> {
  const target = ns.read("bestTarget.txt");
  const hackCost = ns.getScriptRam("hack.js");
  const usableServers = getUsableServers(ns);

  for (const server of usableServers) {
    const availableRam =
      ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    const threads = Math.floor(availableRam / hackCost);
    if (threads > 0) {
      ns.exec("hack.js", server, threads, target);
    }
  }
}
