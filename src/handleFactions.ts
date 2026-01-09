import { NS } from "@ns";
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
  const factions: Record<string, Faction> = {
    CyberSec: {
      name: "CyberSec",
      server: "CSEC",
      isDone: hasDoneFaction(ns, "CyberSec"),
    },
    "Tian Di Hui": {
      name: "Tian Di Hui",
      city: "Chongqing",
      isDone: hasDoneFaction(ns, "Tian Di Hui"),
    },
    NiteSec: {
      name: "NiteSec",
      server: "avmnite-02h",
      isDone: hasDoneFaction(ns, "NiteSec"),
    },
    "The Black Hand": {
      name: "The Black Hand",
      server: "I.I.I.I",
      isDone: hasDoneFaction(ns, "The Black Hand"),
    },
    BitRunners: {
      name: "BitRunners",
      server: "run4theh111z",
      isDone: hasDoneFaction(ns, "BitRunners"),
    },
    Daedalus: {
      name: "Daedalus",
      isDone: hasDoneFaction(ns, "Daedalus"),
    },
    "Leaving Cave": {
      name: "LeavingCave",
      server: "w0r1d_d43m0n",
      isDone: false,
    },
  };

  const joinedFactions = ns.getPlayer().factions;

  if (joinedFactions.length > 0) {
    const faction = joinedFactions[0];
    if (!ns.singularity.isBusy()) {
      const workTypes = ns.singularity.getFactionWorkTypes(faction);
      ns.singularity.workForFaction(faction, workTypes[0], true);
    }

    // const isFocused = ns.singularity.isFocused();
    // if (!isFocused) {
    //   ns.singularity.setFocus(true);
    // }

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

    const isAllServersMaxedOut = ns
      .getPurchasedServers()
      .every(
        (server) => ns.getServerMaxRam(server) === ns.getPurchasedServerMaxRam()
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

  if (
    !factions["CyberSec"].isDone &&
    ns.singularity.checkFactionInvitations().includes("CyberSec")
  ) {
    ns.singularity.joinFaction("CyberSec");
  } else if (!factions["Tian Di Hui"].isDone) {
    if (ns.getPlayer().city !== "Chongqing") {
      ns.singularity.travelToCity("Chongqing");
    }
    if (ns.singularity.checkFactionInvitations().includes("Tian Di Hui")) {
      ns.singularity.joinFaction("Tian Di Hui");
    }
  } else if (
    !factions["NiteSec"].isDone &&
    ns.singularity.checkFactionInvitations().includes("NiteSec")
  ) {
    ns.singularity.joinFaction("NiteSec");
  } else if (
    !factions["The Black Hand"].isDone &&
    ns.singularity.checkFactionInvitations().includes("The Black Hand")
  ) {
    ns.singularity.joinFaction("The Black Hand");
  } else if (
    !factions["BitRunners"].isDone &&
    ns.singularity.checkFactionInvitations().includes("BitRunners")
  ) {
    ns.singularity.joinFaction("BitRunners");
  } else if (
    !factions["Daedalus"].isDone &&
    ns.singularity.checkFactionInvitations().includes("Daedalus")
  ) {
    ns.singularity.joinFaction("Daedalus");
  }
}
