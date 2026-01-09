import { NS } from "@ns";
import { PORTS } from "./PORTS";

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0] as string;
  const oldMoney = ns.args[1] as number;

  const purchasedServers = ns.getPurchasedServers();
  const isAllServersMaxedOut = purchasedServers.every(
    (server) => ns.getServerMaxRam(server) === ns.getPurchasedServerMaxRam()
  );

  const weakenTimeInMs = target ? ns.getWeakenTime(target) : 1;
  const weakenTimeInSeconds = weakenTimeInMs / 1000;
  const money = ns.getPlayer().money;
  const moneyDiff = oldMoney !== undefined ? money - oldMoney : 0;
  const incomePerSec = moneyDiff / weakenTimeInSeconds;

  const upgradeCost = ns.singularity.getUpgradeHomeRamCost();
  const upgradeTakesLongerThan15Minutes = upgradeCost / incomePerSec > 15 * 60;

  const joinedFactions = ns.getPlayer().factions;
  if (joinedFactions.length > 0) {
    const factionName = joinedFactions[0];
    const currentRep = ns.singularity.getFactionRep(factionName);
    const factionAugs = ns.singularity
      .getAugmentationsFromFaction(factionName)
      .filter(
        (aug) =>
          !aug.startsWith("NeuroFlux") &&
          aug !== "Neuroreceptor Management Implant"
      );
    const mostExpensiveAugRep = factionAugs.reduce((acc, aug) => {
      const rep = ns.singularity.getAugmentationRepReq(aug);
      return rep > acc ? rep : acc;
    }, 0);

    const augPercentageProgress = (currentRep / mostExpensiveAugRep) * 100;
    if (augPercentageProgress >= 100) {
      ns.writePort(PORTS.startSharing, false);
      return;
    }
  }

  const currentFaction = joinedFactions[0];
  const isAtDonationThreshold =
    joinedFactions.length > 0 &&
    ns.getFavorToDonate() <= ns.singularity.getFactionFavor(currentFaction);

  if (
    currentFaction !== undefined &&
    isAllServersMaxedOut &&
    incomePerSec > 0 &&
    upgradeTakesLongerThan15Minutes &&
    !isAtDonationThreshold
  ) {
    ns.writePort(PORTS.startSharing, true);
  }
}
