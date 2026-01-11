import { NS } from "../NetscriptDefinitions";
import { hasDoneFaction } from "./hasDoneFaction";

export function main(ns: NS): void {
  const joinedFactions = ns.getPlayer().factions;
  const hasJoinedCyberSec = joinedFactions.some(
    (faction) => faction === "CyberSec"
  );
  if (!hasDoneFaction(ns, "CyberSec") && !hasJoinedCyberSec) {
    const mugChance = ns.singularity.getCrimeChance("Mug");

    if (mugChance >= 1) {
      ns.singularity.commitCrime("Mug");
    }
  }
}
