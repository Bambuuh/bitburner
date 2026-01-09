import { NS } from "../NetscriptDefinitions";

export function hasDoneFaction(ns: NS, factionName: string): boolean {
  const ownedAugs = ns.singularity.getOwnedAugmentations();
  if (factionName === "CyberSec") {
    return ownedAugs.length >= 5;
  }
  if (factionName === "Tian Di Hui") {
    return ownedAugs.length >= 12;
  }
  if (factionName === "NiteSec") {
    return ownedAugs.length >= 20;
  }
  if (factionName === "The Black Hand") {
    return ownedAugs.length >= 24;
  }
  if (factionName === "BitRunners") {
    return ownedAugs.length >= 29;
  }
  if (factionName === "Daedalus") {
    return ownedAugs.length >= 38;
  }
  if (factionName === "Illuminati") {
    return ownedAugs.length >= 40;
  }
  return false;
}
