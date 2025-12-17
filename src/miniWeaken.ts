import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = "n00dles";
  const weakenCost = ns.getScriptRam("weaken.js");

  const availableRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
  const threads = Math.floor(availableRam / weakenCost);
  ns.exec("weaken.js", "home", threads, target);
}
