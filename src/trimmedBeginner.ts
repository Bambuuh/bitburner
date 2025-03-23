import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = "n00dles";

  while (true) {
    const currentServer = ns.getHostname();
    const security = ns.getServerSecurityLevel(target);
    const minSecurity = ns.getServerMinSecurityLevel(target);
    const maxRam = ns.getServerMaxRam(currentServer);
    const usedRam = ns.getServerUsedRam(currentServer);
    const available = maxRam - usedRam;

    if (security > minSecurity + 1) {
      const weakenRam = ns.getScriptRam("weaken.js");
      const weakenTime = ns.getWeakenTime(target);
      const threads = Math.floor(available / weakenRam);
      ns.run("weaken.js", { threads }, target);
      await ns.sleep(weakenTime + 100);
      continue;
    }

    const money = ns.getServerMoneyAvailable(target);
    const maxMoney = ns.getServerMaxMoney(target);

    if (money < maxMoney * 0.75) {
      const growRam = ns.getScriptRam("grow.js");
      const growTime = ns.getGrowTime(target);
      const threads = Math.floor(available / growRam);
      ns.run("grow.js", { threads }, target);
      await ns.sleep(growTime + 100);
      continue;
    }

    const hackRam = ns.getScriptRam("hack.js");
    const hackTime = ns.getHackTime(target);
    const threads = Math.floor(available / hackRam);
    if (threads > 0) {
      ns.run("hack.js", { threads }, target);
      await ns.sleep(hackTime + 100);
      continue;
    }

    await ns.sleep(200);
  }
}
