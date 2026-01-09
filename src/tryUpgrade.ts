import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const money = ns.getPlayer().money;
  const didUpgrade = ns.singularity.upgradeHomeRam();
  ns.singularity.upgradeHomeCores();
  ns.singularity.purchaseTor();
  ns.singularity.purchaseProgram("BruteSSH.exe");
  ns.singularity.purchaseProgram("FTPCrack.exe");
  ns.singularity.purchaseProgram("relaySMTP.exe");
  ns.singularity.purchaseProgram("HTTPWorm.exe");
  ns.singularity.purchaseProgram("SQLInject.exe");
}
