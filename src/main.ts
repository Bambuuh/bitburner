import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = "n00dles";
  const buffer = 200;
  let sleep = 1000;

  while (true) {
    const minSecurity = ns.getServerMinSecurityLevel(target);
    const securityDiff = ns.getServerSecurityLevel(target) - minSecurity;
    const maxMoney = ns.getServerMaxMoney(target);
    const moneyDiff = maxMoney - ns.getServerMoneyAvailable(target);

    const weakenPower = ns.weakenAnalyze(1);

    if (securityDiff > weakenPower) {
      const weakenTime = ns.getWeakenTime(target);
      ns.exec("miniWeaken.js", "home");
      sleep = weakenTime + buffer;
    } else if (moneyDiff > maxMoney * 0.1) {
      const growTime = ns.getGrowTime(target);
      ns.exec("miniGrow.js", "home");
      sleep = growTime + buffer;
    } else {
      const hackTime = ns.getHackTime(target);
      ns.exec("miniHack.js", "home");
      sleep = hackTime + buffer;
    }

    await ns.sleep(sleep);
  }
}
