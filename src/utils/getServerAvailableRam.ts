import { NS } from "@ns";

export function getServerAvailableRam(ns: NS, server: string) {
  const maxRam = ns.getServerMaxRam(server);
  const usedRam = ns.getServerUsedRam(server);
  return maxRam - usedRam;
}
