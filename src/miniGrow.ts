import { NS } from "@ns";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS): Promise<void> {
  const target = ns.read("bestTarget.txt");
  const growCost = ns.getScriptRam("grow.js");
  const usableServers = getUsableServers(ns);

  for (const server of usableServers) {
    const availableRam =
      ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    const threads = Math.floor(availableRam / growCost);
    if (threads > 0) {
      ns.exec("grow.js", server, threads, target);
    }
  }
}
