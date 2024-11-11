import { NS } from "@ns";

export function getHackingValue(ns: NS, server: string) {
  const maxMoney = ns.getServerMaxMoney(server);
  const hackChance = ns.hackAnalyzeChance(server);
  const hackTime = ns.getHackTime(server);

  const hvf = (maxMoney * hackChance) / hackTime; // HVF formula
  return hvf;
}
