import { NS } from "../NetscriptDefinitions";
import { hasDoneFaction } from "./hasDoneFaction";

export async function main(ns: NS): Promise<void> {
  const isLackingDex = ns.getPlayer().skills.dexterity < 40;
  const isLackingStr = ns.getPlayer().skills.strength < 40;
  const isLackingAgi = ns.getPlayer().skills.agility < 40;
  const isLackingDef = ns.getPlayer().skills.defense < 15;
  const isLackingStats =
    isLackingDex || isLackingStr || isLackingDef || isLackingAgi;
  if (!hasDoneFaction(ns, "CyberSec")) {
    if (isLackingStats) {
      if (isLackingDex) {
        ns.singularity.gymWorkout("Powerhouse Gym", "dex");
      } else if (isLackingAgi) {
        ns.singularity.gymWorkout("Powerhouse Gym", "agi");
      } else if (isLackingStr) {
        ns.singularity.gymWorkout("Powerhouse Gym", "str");
      } else if (isLackingDef) {
        ns.singularity.gymWorkout("Powerhouse Gym", "def");
      }
    } else {
      const currentWork = ns.singularity.getCurrentWork();
      if (currentWork?.type === "CLASS") {
        ns.singularity.stopAction();
      }
    }
  }
}
