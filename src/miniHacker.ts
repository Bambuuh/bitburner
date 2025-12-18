import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = ns.read("bestTarget.txt");
  const minSecurity = ns.getServerMinSecurityLevel(target);
  const securityDiff = ns.getServerSecurityLevel(target) - minSecurity;
  const maxMoney = ns.getServerMaxMoney(target);
  const moneyDiff = maxMoney - ns.getServerMoneyAvailable(target);

  const weakenPower = ns.weakenAnalyze(1);

  const isNotWeakEnough = securityDiff > weakenPower;
  const isNotRichEnough = moneyDiff > maxMoney * 0.1;

  if (isNotWeakEnough) {
    ns.exec("miniWeaken.js", "home");
  } else if (isNotRichEnough) {
    ns.exec("miniGrow.js", "home");
  } else if (!isNotWeakEnough && !isNotRichEnough) {
    ns.exec("miniHack.js", "home");
  }
}
