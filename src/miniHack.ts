import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = "n00dles";
  const hackCost = ns.getScriptRam("hack.js");

  const availableRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
  const threads = Math.floor(availableRam / hackCost);
  if (threads > 0) {
    ns.exec("hack.js", "home", threads, target);
  }
}
