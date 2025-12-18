import { NS } from "@ns";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS): Promise<void> {
  while (true) {
    ns.exec("hackServers.js", "home");
    await ns.sleep(100);
    ns.exec("copyScripts.js", "home");
    await ns.sleep(100);
    ns.exec("buyServers.js", "home");
    await ns.sleep(100);
    ns.exec("bestHackTarget.js", "home");
    await ns.sleep(100);
    ns.exec("miniHacker.js", "home");
    await ns.sleep(1000);
  }
}
