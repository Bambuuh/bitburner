import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = "n00dles";
  const growCost = ns.getScriptRam("grow.js");

  const availableRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
  const threads = Math.floor(availableRam / growCost);
  if (threads > 0) {
    ns.exec("grow.js", "home", threads, target);
  }
}
