import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const canShotgun = ns.read("canHomeShotgun.txt") === "true";
  if (canShotgun) {
    ns.exec("shotgun.js", "home");
  } else {
    ns.exec("justInTime.js", "home");
  }
}
