import { NS } from "@ns";
// import { manageServers } from "/utils/manageServers";
import { beginnerManageServers } from "/utils/beginnerManageServers";

export async function main(ns: NS): Promise<void> {
  // ns.run("spider.js");

  const target = "n00dles";

  // ns.run("purchaseServers.js");
  // ns.run("upgradeServers.js");

  // await prepTarget(target);

  while (true) {
    const player = ns.getPlayer();
    const servers = ns.getPurchasedServers();
    // if (servers.length > 4) {
    //   ns.exec("main.js", "home");
    //   return;
    // }
    beginnerManageServers(ns, player, servers);
    const security = ns.getServerSecurityLevel(target);
    const minSecurity = ns.getServerMinSecurityLevel(target);
    const maxRam = ns.getServerMaxRam("home");
    const usedRam = ns.getServerUsedRam("home");
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

  async function prepTarget(target: string) {
    let isPrepped = false;
    ns.tprint(`Prepping ${target}`);

    while (!isPrepped) {
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

      isPrepped = true;
    }

    ns.tprint(`${target} is prepped`);
  }
}
