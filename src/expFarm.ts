import { NS } from "@ns";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS): Promise<void> {
  const servers = getUsableServers(ns);
  for (const server of servers) {
    const availableRam =
      ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    const growCost = ns.getScriptRam("grow.js");
    const threads = Math.floor(availableRam / growCost);
    if (threads > 0) {
      ns.exec("grow.js", server, threads, "joesguns");
    }
  }
}
