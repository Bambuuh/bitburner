import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = ns.read("bestTarget.txt");
  const minSecurity = ns.getServerMinSecurityLevel(target);
  const serverSecurity = ns.getServerSecurityLevel(target);
  const maxMoney = ns.getServerMaxMoney(target);
  const moneyDiff = maxMoney - ns.getServerMoneyAvailable(target);

  const isNotWeakEnough = serverSecurity > minSecurity;
  const isNotRichEnough = moneyDiff > 0;

  if (isNotWeakEnough) {
    ns.exec("miniWeaken.js", "home");
  } else if (isNotRichEnough) {
    ns.exec("miniGrow.js", "home");
  } else {
    ns.write("primeTargetDone.txt", "1", "w");
  }
}
