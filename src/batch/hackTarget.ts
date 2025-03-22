import { NS } from "@ns";
import { getServerAvailableRam } from "/utils/getServerAvailableRam";

type MaxHackValue = {
  growthWeakenThreads: number;
  hackWeakenThreads: number;
  hackThreads: number;
  growThreads: number;
};

export function hackTarget(
  ns: NS,
  target: string,
  servers: string[],
  initalDelay = 0
) {
  const maxMoney = ns.getServerMaxMoney(target);

  if (maxMoney === 0) {
    return 0;
  }

  const growScript = "grow.js";
  const weakenScript = "weaken.js";
  const hackScript = "hack.js";
  const weakenCost = ns.getScriptRam(weakenScript);
  const growCost = ns.getScriptRam(growScript);
  const hackCost = ns.getScriptRam(hackScript);
  const weakenEffect = ns.weakenAnalyze(1);
  const hackTime = ns.getHackTime(target);
  const growTime = ns.getGrowTime(target);
  const weakenTime = ns.getWeakenTime(target);

  const baseDelay = 40;
  const hackWeakenDelay = 0;
  const hackDelay = weakenTime - hackTime - baseDelay;
  const growDelay = weakenTime - growTime + baseDelay;
  const growWeakenDelay = 3 * baseDelay;

  let delay = initalDelay;

  for (const server of servers) {
    const availableRam = getServerAvailableRam(ns, server);
    let res = getMaxHackValue(availableRam);

    while (res) {
      const {
        growThreads,
        growthWeakenThreads,
        hackThreads,
        hackWeakenThreads,
      } = res;

      if (hackThreads > 0) {
        ns.exec(hackScript, server, hackThreads, target, hackDelay + delay);
      }

      if (hackWeakenThreads > 0) {
        ns.exec(
          weakenScript,
          server,
          hackWeakenThreads,
          target,
          hackWeakenDelay + delay
        );
      }

      if (growThreads > 0) {
        ns.exec(growScript, server, growThreads, target, growDelay + delay);
      }

      if (growthWeakenThreads > 0) {
        ns.exec(
          weakenScript,
          server,
          growthWeakenThreads,
          target,
          growWeakenDelay + delay
        );
      }

      delay += baseDelay;
      const availableRam = getServerAvailableRam(ns, server);
      res = getMaxHackValue(availableRam);
    }
  }

  function getMaxHackValue(
    availableRam: number,
    factor = 0.5
  ): MaxHackValue | undefined {
    if (factor < 0.01) {
      return undefined;
    }

    const hackThreads = Math.floor(
      ns.hackAnalyzeThreads(target, maxMoney * factor)
    );
    const remainingAmount = maxMoney * (1 - factor);
    const compensationMultiplier = maxMoney / remainingAmount;

    const growThreadsInitial = Math.ceil(
      ns.growthAnalyze(target, compensationMultiplier)
    );

    const growThreads = Math.max(
      growThreadsInitial + 1,
      Math.ceil(growThreadsInitial * 0.1)
    );

    const growthSecurityIncrease = Math.ceil(
      ns.growthAnalyzeSecurity(growThreads, target)
    );
    const growthWeakenThreads = Math.ceil(
      growthSecurityIncrease / weakenEffect
    );
    const hackSecurityIncrease = ns.hackAnalyzeSecurity(hackThreads, target);
    const hackWeakenThreads = Math.ceil(hackSecurityIncrease / weakenEffect);

    const totalCost =
      growthWeakenThreads * weakenCost +
      hackWeakenThreads * weakenCost +
      hackThreads * hackCost +
      growThreads * growCost;

    if (totalCost > availableRam) {
      if (factor > 0.2) {
        return getMaxHackValue(availableRam, factor - 0.1);
      }
      return getMaxHackValue(availableRam, factor - 0.01);
    }

    return { growthWeakenThreads, hackWeakenThreads, hackThreads, growThreads };
  }

  return delay;
}
