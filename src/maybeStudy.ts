import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const factions = ns.getPlayer().factions;
  if (factions.length === 0) {
    ns.singularity.universityCourse("rothman university", "Computer Science");
  }
}
