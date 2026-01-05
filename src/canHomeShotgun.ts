import { NS } from "@ns";
import { getMockServer } from "./getMockServer";

export async function main(ns: NS): Promise<void> {
  const obj = ns.read("batchTarget.json");
  if (!obj) {
    return;
  }
  const data: BatchData = JSON.parse(obj);
  const target = data.target;
  const mockServer = getMockServer(ns, target);
  const player = ns.getPlayer();
  const weakenEffect = ns.weakenAnalyze(1);
  const hackPercentPerThread = ns.formulas.hacking.hackPercent(
    mockServer,
    player
  );

  const hackThreads = Math.floor(data.multiplier / hackPercentPerThread);

  const hackSecurity = ns.hackAnalyzeSecurity(hackThreads);
  const weakenHackThreads = Math.ceil((hackSecurity / weakenEffect) * 1.2);

  const hackPercent =
    ns.formulas.hacking.hackPercent(mockServer, player) * hackThreads;
  const hackedServer = {
    ...mockServer,
    moneyAvailable: (mockServer.moneyMax ?? 1) * (1 - hackPercent),
  };
  const growThreads = Math.ceil(
    ns.formulas.hacking.growThreads(
      hackedServer,
      player,
      mockServer.moneyMax!
    ) * 1.2
  );
  const growSecurity = ns.growthAnalyzeSecurity(growThreads);
  const weakenGrowthThreads = Math.ceil((growSecurity / weakenEffect) * 1.2);

  const ramCost =
    ns.getScriptRam("hack.js") * hackThreads +
    ns.getScriptRam("weaken.js") * weakenHackThreads +
    ns.getScriptRam("grow.js") * growThreads +
    ns.getScriptRam("weaken.js") * weakenGrowthThreads;

  const homeRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
  const shotgunCost = ns.getScriptRam("shotgun.js");
  const canShotgun = homeRam >= ramCost + shotgunCost;

  ns.write("canHomeShotgun.txt", canShotgun.toString(), "w");
}
