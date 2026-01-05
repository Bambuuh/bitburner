import { NS } from "@ns";
import { getMockServer } from "./getMockServer";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS): Promise<void> {
  const obj = ns.read("batchTarget.json");
  if (!obj) {
    ns.tprint("No batch target found");
    return;
  }
  const data: BatchData = JSON.parse(obj);
  const target = data.target;

  const servers = getUsableServers(ns);

  const mockServer = getMockServer(ns, target);

  const player = ns.getPlayer();
  const weakenTime = ns.formulas.hacking.weakenTime(mockServer, player);
  const growTime = ns.formulas.hacking.growTime(mockServer, player);
  const hackTime = ns.formulas.hacking.hackTime(mockServer, player);
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
  let counter = 0;
  for (const server of servers) {
    let availableRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    while (availableRam > ramCost) {
      ns.exec("hack.js", server, hackThreads, target, weakenTime - hackTime);
      ns.exec("weaken.js", server, weakenHackThreads, target);
      ns.exec("grow.js", server, growThreads, target, weakenTime - growTime);
      ns.exec("weaken.js", server, weakenGrowthThreads, target);
      availableRam -= ramCost;
      counter += 1;
    }
  }
}
