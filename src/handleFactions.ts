import { NS } from "@ns";
import { deepConnectFn } from "./deepConnectFn";

type Faction = {
  name: string;
  server?: string;
  city?: string;
  isDone: boolean;
};

const factions: Record<string, Faction> = {
  CyberSec: {
    name: "CyberSec",
    server: "CSEC",
    isDone: false,
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

export async function main(ns: NS): Promise<void> {
  const joinedFactions = ns.getPlayer().factions;

  if (joinedFactions.length > 0) {
    const workTypes = ns.singularity.getFactionWorkTypes(joinedFactions[0]);
    ns.singularity.workForFaction(
      joinedFactions[0],
      workTypes[0],
      !ns.singularity.isBusy()
    );

    const auguments = ns.singularity.getAugmentationsFromFaction(
      joinedFactions[0]
    );

    ns.tprint(auguments);

    return;
  }

  if (
    !factions["CyberSec"].isDone &&
    ns.singularity.checkFactionInvitations().includes("CyberSec")
  ) {
    deepConnectFn(ns, "CSEC");
    ns.singularity.joinFaction("CyberSec");
    factions["CyberSec"].isDone = true;
    ns.singularity.connect("home");
  }
}
