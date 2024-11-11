import { NS } from "@ns";

export async function batchHack(
  ns: NS,
  target: string,
  hackPercentage: number
) {
  if (hackPercentage <= 0.01) {
    return;
  }

  const hackScript = "hack.js";
  const growScript = "grow.js";
  const weakenScript = "weaken.js";

  const hackTime = ns.getHackTime(target);
  const growTime = ns.getGrowTime(target);
  const weakenTime = ns.getWeakenTime(target);

  const serverMaxMoney = ns.getServerMaxMoney(target);
  const moneyToHack = serverMaxMoney * hackPercentage;
  const hackThreads = Math.floor(ns.hackAnalyzeThreads(target, moneyToHack));

  const postHackMoney = serverMaxMoney - moneyToHack;
  const growThreads = Math.ceil(
    ns.growthAnalyze(target, serverMaxMoney / postHackMoney)
  );

  const hackSecurityIncrease = ns.hackAnalyzeSecurity(hackThreads);
  const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads);

  const weakenThreadsHack = Math.ceil(hackSecurityIncrease / 0.05);
  const weakenThreadsGrow = Math.ceil(growSecurityIncrease / 0.05);

  const addedDelay = 20;
  const delayHack = weakenTime - hackTime + addedDelay;
  const delayGrow = weakenTime - growTime + addedDelay;
  const delayWeakenHack = addedDelay;
  const delayWeakenGrow = delayGrow + addedDelay;

  // List all servers (not including "home" for task allocation)
  const servers = ns.getPurchasedServers();
  const availableServers = ["home", ...servers];

  // Calculate total threads needed and the total RAM required
  const hackCost = ns.getScriptRam(hackScript);
  const growCost = ns.getScriptRam(growScript);
  const weakenCost = ns.getScriptRam(weakenScript);

  const totalCost =
    hackCost * hackThreads +
    growCost * growThreads +
    weakenCost * (weakenThreadsHack + weakenThreadsGrow);

  // Check if available RAM is sufficient on home and purchased servers
  const remainingThreads = {
    hackThreads,
    growThreads,
    weakenThreadsHack,
    weakenThreadsGrow,
  };
  const remainingCost = totalCost;

  for (const server of availableServers) {
    const serverMaxRam = ns.getServerMaxRam(server);
    const serverUsedRam = ns.getServerUsedRam(server);
    const serverAvailableRam = serverMaxRam - serverUsedRam;

    if (serverAvailableRam >= remainingCost) {
      // Allocate remaining threads to this server
      if (remainingThreads.hackThreads > 0) {
        const hackThreadAllocation = Math.min(
          remainingThreads.hackThreads,
          Math.floor(serverAvailableRam / hackCost)
        );
        ns.exec(
          hackScript,
          server,
          hackThreadAllocation,
          target,
          delayHack,
          Date.now()
        );
        remainingThreads.hackThreads -= hackThreadAllocation;
      }

      if (remainingThreads.growThreads > 0) {
        const growThreadAllocation = Math.min(
          remainingThreads.growThreads,
          Math.floor(serverAvailableRam / growCost)
        );
        ns.exec(
          growScript,
          server,
          growThreadAllocation,
          target,
          delayGrow,
          Date.now()
        );
        remainingThreads.growThreads -= growThreadAllocation;
      }

      if (remainingThreads.weakenThreadsHack > 0) {
        const weakenThreadHackAllocation = Math.min(
          remainingThreads.weakenThreadsHack,
          Math.floor(serverAvailableRam / weakenCost)
        );
        ns.exec(
          weakenScript,
          server,
          weakenThreadHackAllocation,
          target,
          delayWeakenHack,
          Date.now()
        );
        remainingThreads.weakenThreadsHack -= weakenThreadHackAllocation;
      }

      if (remainingThreads.weakenThreadsGrow > 0) {
        const weakenThreadGrowAllocation = Math.min(
          remainingThreads.weakenThreadsGrow,
          Math.floor(serverAvailableRam / weakenCost)
        );
        ns.exec(
          weakenScript,
          server,
          weakenThreadGrowAllocation,
          target,
          delayWeakenGrow,
          Date.now()
        );
        remainingThreads.weakenThreadsGrow -= weakenThreadGrowAllocation;
      }
    }
  }

  // If some threads couldn't be allocated (because RAM was not enough), call the batchHack again with a reduced hackPercentage
  if (
    remainingThreads.hackThreads > 0 ||
    remainingThreads.growThreads > 0 ||
    remainingThreads.weakenThreadsHack > 0 ||
    remainingThreads.weakenThreadsGrow > 0
  ) {
    batchHack(ns, target, hackPercentage - 0.01);
  }
}
