import { NS } from "../NetscriptDefinitions";

export function hasDoneFaction(ns: NS, factionName: string): boolean {
  const ownedAugs = ns.singularity.getOwnedAugmentations();
  if (factionName === "CyberSec") {
    return ownedAugs.includes("Cranial Signal Processors - Gen II");
  }
  return false;
}
