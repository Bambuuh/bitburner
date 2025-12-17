import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = "n00dles";
  // const buffer = 200;
  // let sleep = 1000;

  const minSecurity = ns.getServerMinSecurityLevel(target);
  const securityDiff = ns.getServerSecurityLevel(target) - minSecurity;
  const maxMoney = ns.getServerMaxMoney(target);
  const moneyDiff = maxMoney - ns.getServerMoneyAvailable(target);

  const weakenPower = ns.weakenAnalyze(1);

  const isNotWeakEnough = securityDiff > weakenPower;
  const isNotRichEnough = moneyDiff > maxMoney * 0.1;

  if (isNotWeakEnough) {
    // const weakenTime = ns.getWeakenTime(target);
    ns.exec("miniWeaken.js", "home");
    // sleep = weakenTime + buffer;
  } else if (isNotRichEnough) {
    // const growTime = ns.getGrowTime(target);
    ns.exec("miniGrow.js", "home");
    // sleep = growTime + buffer;
  } else if (!isNotWeakEnough && !isNotRichEnough) {
    // const hackTime = ns.getHackTime(target);
    ns.exec("miniHack.js", "home");
    // sleep = hackTime + buffer;
  }

  // await ns.sleep(sleep);
}
