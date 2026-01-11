import { NS } from "@ns";
import { getNerufluxLevel, isAtNeurofluxMax } from "./getNerufluxLevel";
import { hasDoneFaction } from "./hasDoneFaction";

type Faction = {
  name: string;
  server?: string;
  city?: string;
  isDone: boolean;
};

function canInstallAugumentation(ns: NS, aug: string): boolean {
  const owned = ns.singularity.getOwnedAugmentations(true);

  const prereqs = ns.singularity.getAugmentationPrereq(aug);
  return (
    prereqs.length === 0 || prereqs.every((req: string) => owned.includes(req))
  );
}

export async function main(ns: NS): Promise<void> {
  const factions: Faction[] = [
    {
      name: "CyberSec",
      server: "CSEC",
      isDone: hasDoneFaction(ns, "CyberSec"),
    },
    {
      name: "Tian Di Hui",
      city: "Chongqing",
      isDone: hasDoneFaction(ns, "Tian Di Hui"),
    },
    {
      name: "NiteSec",
      server: "avmnite-02h",
      isDone: hasDoneFaction(ns, "NiteSec"),
    },
    {
      name: "The Black Hand",
      server: "I.I.I.I",
      isDone: hasDoneFaction(ns, "The Black Hand"),
    },
    {
      name: "BitRunners",
      server: "run4theh111z",
      isDone: hasDoneFaction(ns, "BitRunners"),
    },
    {
      name: "Daedalus",
      isDone: hasDoneFaction(ns, "Daedalus"),
    },
  ];

  const isAllServersMaxedOut = ns
    .getPurchasedServers()
    .every(
      (server) => ns.getServerMaxRam(server) === ns.getPurchasedServerMaxRam()
    );
  const nextFaction = factions.find((faction) => !faction.isDone);

  if (!nextFaction) {
    if (!isAtNeurofluxMax(ns) && isAllServersMaxedOut) {
      if (ns.singularity.checkFactionInvitations().includes("Daedalus")) {
        ns.singularity.joinFaction("Daedalus");
      }
      if (ns.getPlayer().factions.includes("Daedalus")) {
        const currentRep = ns.singularity.getFactionRep("Daedalus");
        const requiredRep =
          ns.singularity.getAugmentationRepReq("NeuroFlux Governor");
        if (currentRep < requiredRep) {
          ns.singularity.donateToFaction("Daedalus", ns.getPlayer().money);
        } else {
          let canInstall = true;
          while (canInstall) {
            const installed = ns.singularity.purchaseAugmentation(
              "Daedalus",
              "NeuroFlux Governor"
            );
            canInstall = installed;
          }
        }
      }
    } else {
      ns.singularity.installAugmentations("main.js");
    }

    return;
  }

  const joinedFactions = ns.getPlayer().factions;

  if (nextFaction && joinedFactions.includes(nextFaction.name)) {
    const faction = joinedFactions[0];
    if (!ns.singularity.isBusy()) {
      const workTypes = ns.singularity.getFactionWorkTypes(faction);
      ns.singularity.workForFaction(faction, workTypes[0], true);
    }

    if (faction === "Daedalus") {
      const currentFavor = ns.singularity.getFactionFavor(faction);
      const favorGain =
        currentFavor + ns.singularity.getFactionFavorGain(faction);
      const donationThresHold = ns.getFavorToDonate();
      const isAtFirstThreshHold = currentFavor < 25 && favorGain >= 25;
      const isAtSecondThreshHold = currentFavor < 75 && favorGain >= 75;
      const isAtThirdThreshHold =
        currentFavor < donationThresHold && favorGain >= donationThresHold;
      if (isAtThirdThreshHold || isAtSecondThreshHold || isAtFirstThreshHold) {
        ns.singularity.joinFaction("Sector-12");
        const workTypes = ns.singularity.getFactionWorkTypes("Sector-12");
        ns.singularity.workForFaction("Sector-12", workTypes[0], true);
      }
    }

    if (joinedFactions.includes("Sector-12")) {
      const installedAugs = ns.singularity.getOwnedAugmentations(true);
      const auguments = ns.singularity
        .getAugmentationsFromFaction("Sector-12")
        .filter(
          (aug: string) =>
            !installedAugs.includes(aug) && canInstallAugumentation(ns, aug)
        );

      auguments.sort(
        (a, b) =>
          ns.singularity.getAugmentationRepReq(a) -
          ns.singularity.getAugmentationRepReq(b)
      );
      if (auguments.length > 0) {
        ns.singularity.purchaseAugmentation("Sector-12", auguments[0]);
        ns.singularity.installAugmentations("main.js");
      }
      return;
    }

    const currentRep = ns.singularity.getFactionRep(faction);
    const installedAugs = ns.singularity.getOwnedAugmentations(true);
    const auguments = ns.singularity
      .getAugmentationsFromFaction(faction)
      .filter(
        (aug: string) =>
          !aug.startsWith("NeuroFlux") &&
          aug !== "Neuroreceptor Management Implant" &&
          !installedAugs.includes(aug) &&
          canInstallAugumentation(ns, aug)
      );

    auguments.sort(
      (a, b) =>
        ns.singularity.getAugmentationPrice(b) -
        ns.singularity.getAugmentationPrice(a)
    );

    const missingRepForAug =
      auguments[0] &&
      ns.singularity.getAugmentationRepReq(auguments[0]) > currentRep;

    const canDonate =
      ns.singularity.getFactionFavor(faction) >= ns.getFavorToDonate();

    if (canDonate && isAllServersMaxedOut && missingRepForAug) {
      ns.singularity.donateToFaction(faction, ns.getPlayer().money);
      return;
    }

    let nextAug = auguments.shift();
    let canInstall = true;
    while (nextAug && canInstall) {
      canInstall = ns.singularity.purchaseAugmentation(faction, nextAug);
      nextAug = auguments.shift();
    }

    const totalList = ns.singularity
      .getAugmentationsFromFaction(faction)
      .filter(
        (aug: string) =>
          aug !== "Neuroreceptor Management Implant" &&
          (aug.startsWith("NeuroFlux") || !installedAugs.includes(aug))
      );

    if (totalList.length === 1) {
      let canInstall = true;
      while (canInstall) {
        const installed = ns.singularity.purchaseAugmentation(
          faction,
          totalList[0]
        );
        canInstall = installed;
      }

      ns.singularity.installAugmentations("main.js");
    }

    return;
  }

  if (nextFaction) {
    if (nextFaction.city) {
      ns.singularity.travelToCity("Chongqing");
    }
    if (ns.singularity.checkFactionInvitations().includes(nextFaction.name)) {
      ns.singularity.joinFaction(nextFaction.name);
    }
  }
}
