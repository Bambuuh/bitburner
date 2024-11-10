import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = "n00dles";

  while (true) {
    const security = ns.getServerSecurityLevel(target);
    const minSecurity = ns.getServerMinSecurityLevel(target);
    const maxRam = ns.getServerMaxRam("home");
    const usedRam = ns.getServerUsedRam("home");
    const available = maxRam - usedRam;

    if (security > minSecurity) {
      const weakenRam = ns.getScriptRam("weaken.js");
      const weakenTime = ns.getWeakenTime(target);
      const threads = Math.floor(available / weakenRam);
      ns.run("weaken.js", { threads }, target);
      await ns.sleep(weakenTime + 100);
      continue;
    }

    const money = ns.getServerMoneyAvailable(target);
    const maxMoney = ns.getServerMaxMoney(target);

    if (money < maxMoney) {
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
    ns.run("hack.js", { threads }, target);
    await ns.sleep(hackTime + 100);
  }
}
