import { NS } from "@ns";
import { deepConnectFn } from "./deepConnectFn";
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
      isDone: false,
    },
    NiteSec: {
      name: "NiteSec",
      server: "avmnite-02h",
      isDone: false,
    },
    "The Black Hand": {
      name: "The Black Hand",
      server: "I.I.I.I",
      isDone: false,
    },
    BitRunners: {
      name: "BitRunners",
      server: "run4theh111z",
      isDone: false,
    },
    Daedalus: {
      name: "Daedalus",
      isDone: false,
    },
    Illuminati: {
      name: "Illuminati",
      server: "w0r1d_d43m0n",
      isDone: false,
    },
  };

  const joinedFactions = ns.getPlayer().factions;

  if (joinedFactions.length > 0) {
    const workTypes = ns.singularity.getFactionWorkTypes(joinedFactions[0]);
    ns.singularity.workForFaction(
      joinedFactions[0],
      workTypes[0],
      !ns.singularity.isBusy()
    );

    const installedAugs = ns.singularity.getOwnedAugmentations(true);
    const auguments = ns.singularity
      .getAugmentationsFromFaction(joinedFactions[0])
      .filter(
        (aug: string) =>
          !aug.startsWith("NeuroFlux") &&
          !installedAugs.includes(aug) &&
          canInstallAugumentation(ns, aug)
      );

    auguments.sort(
      (a, b) =>
        ns.singularity.getAugmentationPrice(b) -
        ns.singularity.getAugmentationPrice(a)
    );

    const nextAug = auguments[0];
    if (nextAug) {
      ns.singularity.purchaseAugmentation(joinedFactions[0], nextAug);
    }

    const totalList = ns.singularity
      .getAugmentationsFromFaction(joinedFactions[0])
      .filter(
        (aug: string) =>
          aug.startsWith("NeuroFlux") || !installedAugs.includes(aug)
      );

    if (totalList.length === 1) {
      let canInstall = true;
      while (canInstall) {
        const installed = ns.singularity.purchaseAugmentation(
          joinedFactions[0],
          totalList[0]
        );
        canInstall = installed;
      }

      ns.singularity.installAugmentations("main.js");
    }

    return;
  }

  //

  if (
    !factions["CyberSec"].isDone &&
    ns.singularity.checkFactionInvitations().includes("CyberSec")
  ) {
    deepConnectFn(ns, "CSEC");
    ns.singularity.joinFaction("CyberSec");
    factions["CyberSec"].isDone = true;
    ns.singularity.connect("home");
  } else if (!factions["Tian Di Hui"].isDone) {
    if (ns.getPlayer().city !== "Chongqing") {
      ns.singularity.travelToCity("Chongqing");
    }
    if (ns.singularity.checkFactionInvitations().includes("Tian Di Hui")) {
      ns.singularity.joinFaction("Tian Di Hui");
    }
  }
}
