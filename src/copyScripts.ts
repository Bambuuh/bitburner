import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const scripts = ["hack.js", "grow.js", "weaken.js", "trimmedBeginner.js"];
  const purchasedServers = ns.getPurchasedServers();

  for (const server of purchasedServers) {
    for (const script of scripts) {
      ns.scp(script, server);
    }
  }
}
