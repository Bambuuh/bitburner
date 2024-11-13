import { NS } from "@ns";

export function batchPrepp(
  ns: NS,
  purchasedServers: string[],
  targets: string[]
): { target: string; TTL: number }[] {
  const ownServers = ["home", ...purchasedServers];
  const weakenScript = "weaken.js";
  const weakenCost = ns.getScriptRam(weakenScript);
  const weakenPerThread = ns.weakenAnalyze(1);

  const preppingServers: { target: string; TTL: number }[] = [];

  targets.forEach((target) => {
    const weakenTime = ns.getWeakenTime(target);
    const serverMinSecurity = ns.getServerMinSecurityLevel(target);
    const serverSecurity = ns.getServerSecurityLevel(target);
    const missingSecurity = serverSecurity - serverMinSecurity;

    if (missingSecurity > 0) {
      let threadsNeeded = Math.ceil(missingSecurity / weakenPerThread);
      let isPrepping = false;

      for (let i = 0; i < ownServers.length && threadsNeeded > 0; i++) {
        if (threadsNeeded <= 0) {
          break;
        }

        const host = ownServers[i];
        const availableRam =
          ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
        const maxThreadsForServer = Math.floor(availableRam / weakenCost);

        const threadsToUse = Math.min(threadsNeeded, maxThreadsForServer);

        if (threadsToUse > 0) {
          ns.exec(weakenScript, host, threadsToUse, target, 0, Date.now());
          isPrepping = true;
          threadsNeeded -= threadsToUse;
        }
      }
      if (isPrepping) {
        preppingServers.push({ target, TTL: weakenTime + 50 });
      }
    }
  });

  return preppingServers;
}
