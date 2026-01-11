import { CrimeType, NS } from "../NetscriptDefinitions";
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

      const robStats = ns.singularity.getCrimeStats("Rob Store");
      const shopLiftStats = ns.singularity.getCrimeStats("Shoplift");
      const mugStats = ns.singularity.getCrimeStats("Mug");
      const robMoney = robStats.money / robStats.time;
      const shopLiftMoney = shopLiftStats.money / shopLiftStats.time;
      const mugMoney = mugStats.money / mugStats.time;

      const crimes = [
        {
          type: "Rob Store",
          money: robMoney,
          robStats,
          chance: ns.singularity.getCrimeChance("Rob Store"),
        },
        {
          type: "Shoplift",
          money: shopLiftMoney,
          shopLiftStats,
          chance: ns.singularity.getCrimeChance("Shoplift"),
        },
        {
          type: "Mug",
          money: mugMoney,
          mugStats,
          chance: ns.singularity.getCrimeChance("Mug"),
        },
      ]
        .filter((crime) => crime.chance >= 1)
        .sort((a, b) => b.money - a.money);

      const bestAction = crimes[0];

      if (bestAction) {
        ns.singularity.commitCrime(bestAction.type as CrimeType);
      }
    }
  }
}
