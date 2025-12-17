import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  while (true) {
    ns.exec("hackServers.js", "home");
    await ns.sleep(100);
    ns.exec("miniHacker.js", "home");
    await ns.sleep(1000);
  }
}
