import { NS } from "@ns";
import { hasDoneFaction } from "./hasDoneFaction";

export async function main(ns: NS): Promise<void> {
  const hasDoneCSEC = hasDoneFaction(ns, "CyberSec");

  if (
    !hasDoneCSEC &&
    ns.singularity.checkFactionInvitations().includes("CyberSec")
  ) {
    ns.singularity.joinFaction("CyberSec");
    ns.singularity.workForFaction("CyberSec", "hacking", true);
  }
}
