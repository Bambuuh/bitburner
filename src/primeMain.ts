import { NS } from "@ns";
import { primeGrow } from "./primeGrow";
import { primeWeaken } from "./primeWeaken";

export async function main(ns: NS): Promise<void> {
  const argsTarget = ns.args[0] as string | undefined;
  const target =
    argsTarget !== undefined && argsTarget !== ""
      ? argsTarget
      : ns.read("bestTarget.txt");

  const minSecurity = ns.getServerMinSecurityLevel(target);
  const serverSecurity = ns.getServerSecurityLevel(target);
  const maxMoney = Math.floor(ns.getServerMaxMoney(target));
  const currentMoney = Math.floor(ns.getServerMoneyAvailable(target));

  if (serverSecurity > minSecurity) {
    primeWeaken(ns, target);
  } else if (currentMoney < maxMoney) {
    primeGrow(ns, target);
  } else {
    const primeData: PrimeData = {
      endTime: Date.now(),
      status: "ready",
      target,
    };
    const primeDataStr = JSON.stringify(primeData);
    ns.write("primeTargetData.json", primeDataStr, "w");
  }
}
