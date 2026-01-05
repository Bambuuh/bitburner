import { NS } from "../NetscriptDefinitions";
import { getUsableServers } from "./getUsableServers";

export async function primeWeaken(ns: NS, target: string) {
  const minSecurity = ns.getServerMinSecurityLevel(target);
  const serverSecurity = ns.getServerSecurityLevel(target);
  const weakenEffect = ns.weakenAnalyze(1);
  let threadsRequired = Math.ceil(
    (serverSecurity - minSecurity) / weakenEffect
  );
  const servers = getUsableServers(ns);
  const weakenTime = ns.getWeakenTime(target);
  const weakenCost = ns.getScriptRam("weaken.js");

  for (const server of servers) {
    const maxRam = ns.getServerMaxRam(server);
    const usedRam = ns.getServerUsedRam(server);
    const availableRam = maxRam - usedRam;

    const possibleThreads = Math.min(
      threadsRequired,
      Math.floor(availableRam / weakenCost)
    );

    if (possibleThreads > 0) {
      ns.exec("weaken.js", server, possibleThreads, target);
      threadsRequired -= possibleThreads;
    }

    if (threadsRequired <= 0) break;
  }

  const primeData: PrimeData = {
    endTime: Date.now() + weakenTime + 100,
    status: "weakening",
    target,
  };
  const primeDataStr = JSON.stringify(primeData);
  ns.write("primeTargetData.json", primeDataStr, "w");
}
