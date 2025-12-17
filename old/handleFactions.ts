import { NS } from "@ns";

const factionOrder = ["CyberSec"];

export async function main(ns: NS): Promise<void> {
  const player = ns.getPlayer();
  const req = ns.singularity.getFactionInviteRequirements("CyberSec");
  ns.singularity.getAugmentationsFromFaction();
  ns.singularity.ns.tprint(req);
}
