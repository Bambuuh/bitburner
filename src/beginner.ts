import { NS } from "@ns";
// import { manageServers } from "/utils/manageServers";
import { beginnerManageServers } from "/utils/beginnerManageServers";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  const target = "n00dles";
  ns.nuke(target);

  while (true) {
    const player = ns.getPlayer();
    const servers = ns.getPurchasedServers();

    const isAllServersBig =
      servers.length > 20 &&
      servers.every((server) => ns.getServerMaxRam(server) >= 32);

    ns.tprint(isAllServersBig);

    if (isAllServersBig) {
      servers.forEach((server) => {
        ns.killall(server);
      });

      ns.tprint("Switching to main");

      ns.killall("home", true);
      ns.run("main.js");
      ns.kill(ns.pid);
    }

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
}
