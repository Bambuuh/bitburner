import { NS } from "@ns";

export function batchHack(
  ns: NS,
  target: string,
  hackPercentage: number,
  batchStart = Date.now()
) {
  if (hackPercentage <= 0.01) {
    return Date.now();
  }

  const hackScript = "hack.js";
  const growScript = "grow.js";
  const weakenScript = "weaken.js";

  const hackTime = ns.getHackTime(target);
  const growTime = ns.getGrowTime(target);
  const weakenTime = ns.getWeakenTime(target);

  const serverMaxMoney = ns.getServerMaxMoney(target);
  // const moneyToHack = serverMaxMoney * 1;
  const moneyToHack = serverMaxMoney * 0.9;
  const hackThreads = Math.max(
    1,
    Math.floor(ns.hackAnalyzeThreads(target, serverMaxMoney))
  );

  const postHackMoney = serverMaxMoney - moneyToHack;
  const growThreads = Math.ceil(
    ns.growthAnalyze(target, serverMaxMoney / postHackMoney)
  );

  const hackSecurityIncrease = ns.hackAnalyzeSecurity(hackThreads);
  const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads);

  const weakenThreadsHack = Math.ceil(ns.weakenAnalyze(hackSecurityIncrease));
  const weakenThreadsGrow = Math.ceil(ns.weakenAnalyze(growSecurityIncrease));

  const delay = 20;
  const hackWeakenDelay = 0;
  const hackDelay = weakenTime - hackTime - delay;
  const growDelay = weakenTime - growTime + 20;
  const growWeakenDelay = 3 * delay;

  const servers = ns.getPurchasedServers();
  const availableServers = ["home", ...servers];

  const hackCost = ns.getScriptRam(hackScript);
  const growCost = ns.getScriptRam(growScript);
  const weakenCost = ns.getScriptRam(weakenScript);

  const totalCost =
    hackCost * hackThreads +
    growCost * growThreads +
    weakenCost * (weakenThreadsHack + weakenThreadsGrow);

  let baseDelay = Math.max(batchStart - Date.now(), 0);

  for (const server of availableServers) {
    const serverMaxRam = ns.getServerMaxRam(server);
    let serverUsedRam = ns.getServerUsedRam(server);
    let serverAvailableRam = serverMaxRam - serverUsedRam;

    while (serverAvailableRam >= totalCost) {
      if (serverAvailableRam >= totalCost) {
        if (hackThreads > 0) {
          ns.exec(
            hackScript,
            server,
            hackThreads,
            target,
            hackDelay + baseDelay,
            Date.now()
          );
        }

        if (growThreads > 0) {
          ns.exec(
            growScript,
            server,
            growThreads,
            target,
            growDelay + baseDelay,
            Date.now()
          );
        }

        if (weakenThreadsHack) {
          ns.exec(
            weakenScript,
            server,
            weakenThreadsHack,
            target,
            hackWeakenDelay + baseDelay,
            Date.now()
          );
        }

        if (weakenThreadsGrow) {
          ns.exec(
            weakenScript,
            server,
            weakenThreadsGrow,
            target,
            growWeakenDelay + baseDelay,
            Date.now()
          );
        }
        baseDelay += 4 * delay;
      }
      serverUsedRam = ns.getServerUsedRam(server);
      serverAvailableRam = serverMaxRam - serverUsedRam;
    }
  }

  return Date.now() + weakenTime + delay * 3 + baseDelay;
}
