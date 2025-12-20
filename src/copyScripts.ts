import { NS } from "@ns";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS): Promise<void> {
  const scripts = ["hack.js", "grow.js", "weaken.js", "share.js"];
  const usableServers = getUsableServers(ns);

  for (const server of usableServers) {
    for (const script of scripts) {
      ns.scp(script, server);
    }
  }
}
