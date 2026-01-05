import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const didUpgradeMain = ns.singularity.upgradeHomeRam();
  if (didUpgradeMain) {
    const ram = ns.getServerMaxRam("home");
    ns.tprint(`Upgraded home RAM to ${ram} GB`);
  }

  ns.singularity.purchaseTor();
  ns.singularity.purchaseProgram("BruteSSH.exe");
  ns.singularity.purchaseProgram("FTPCrack.exe");
  ns.singularity.purchaseProgram("relaySMTP.exe");
  ns.singularity.purchaseProgram("HTTPWorm.exe");
  ns.singularity.purchaseProgram("SQLInject.exe");
}
