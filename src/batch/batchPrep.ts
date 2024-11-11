import { NS } from "@ns";

export function batchPrepp(
  ns: NS,
  target: string
): { target: string; TTL: number } | undefined {
  const host = "home";
  const weakenScript = "weaken.js";
  const weakenCost = ns.getScriptRam(weakenScript);

  const weakenTime = ns.getWeakenTime(target);
  const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

  const serverSecurity = ns.getServerSecurityLevel(target);
  const serverMinSecurity = ns.getServerMinSecurityLevel(target);
  const missingSecurity = serverSecurity - serverMinSecurity;

  if (missingSecurity > 0) {
    const weakenPerThread = ns.weakenAnalyze(1);
    const threadsNeeded = Math.ceil(missingSecurity / weakenPerThread);
    const ramCost = weakenCost * threadsNeeded;
    if (threadsNeeded > 0 && availableRam >= ramCost) {
      ns.exec(weakenScript, host, threadsNeeded, target, 0, Date.now());
      return { target, TTL: weakenTime + 50 };
    }
  }

  return undefined;
}
