import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  // const target = ns.read("bestTarget.txt");
  const target = "n00dles";
  const minSecurity = ns.getServerMinSecurityLevel(target);
  const securityDiff = ns.getServerSecurityLevel(target) - minSecurity;
  const maxMoney = ns.getServerMaxMoney(target);
  const moneyDiff = maxMoney - ns.getServerMoneyAvailable(target);

  const weakenPower = ns.weakenAnalyze(1);

  const isNotWeakEnough = securityDiff > weakenPower;
  const isNotRichEnough = moneyDiff > maxMoney * 0.1;

  if (isNotWeakEnough || isNotRichEnough) {
    const primeData = ns.read("primeTargetData.txt");
    const parsedPrimeData: PrimeData | null = primeData
      ? JSON.parse(primeData)
      : null;
    if (!parsedPrimeData || parsedPrimeData.endTime < Date.now()) {
      ns.exec("primeMain.js", "home", {}, target);
    }
  } else {
    ns.exec("miniHack.js", "home");
  }
}
