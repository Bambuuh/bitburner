import { NS } from "@ns";
import { getGrowthThreads } from "/utils/getGrowthThreads";
import { getServerAvailableRam } from "/utils/getServerAvailableRam";

export function primeTarget(
  ns: NS,
  target: string,
  servers: string[]
): PrimeCandidate {
  const growScript = "grow.js";
  const weakenScript = "weaken.js";
  const maxMoney = ns.getServerMaxMoney(target);
  const currMoney = ns.getServerMoneyAvailable(target);
  const minSecurity = ns.getServerMinSecurityLevel(target);
  const currSecurity = ns.getServerSecurityLevel(target);
  const weakenCost = ns.getScriptRam(weakenScript);
  const growCost = ns.getScriptRam(growScript);
  const weakenEffect = ns.weakenAnalyze(1);
  const missingSecurity = currSecurity - minSecurity;
  const weakenPerThread = ns.weakenAnalyze(1);

  const weakenTime = ns.getWeakenTime(target);
  const growTime = ns.getGrowTime(target);

  const baseDelay = 100;
  const growDelay = weakenTime - growTime - baseDelay;
  const weakenMargin = 1.2;
  const growMargin = 1.2;

  if (missingSecurity > 0) {
    let threadsRemaining = Math.ceil(
      (missingSecurity / weakenPerThread) * weakenMargin
    );

    for (const server of servers) {
      if (threadsRemaining <= 0) {
        break;
      }

      const availableRam = getServerAvailableRam(ns, server);
      const maxThreads = Math.floor(availableRam / weakenCost);

      if (maxThreads > 0) {
        const threads = Math.min(maxThreads, threadsRemaining);
        const execResult = ns.exec(weakenScript, server, threads, target);

        if (execResult === 0) {
          ns.tprint(`Failed to execute weaken script on ${server}`);
        }
        threadsRemaining -= threads;
      }
    }
    return {
      server: target,
      status: "weakening",
      TTL: Date.now() + weakenTime + baseDelay,
    };
  } else if (currMoney < maxMoney) {
    let growThreadsRemaining = getGrowthThreads(ns, target);

    let delay = 0;

    for (const server of servers) {
      if (growThreadsRemaining <= 0) {
        break;
      }

      const availableRam = getServerAvailableRam(ns, server);
      const maxThreads = getMaxThreads(availableRam, growThreadsRemaining);

      if (maxThreads) {
        const growThreads = Math.min(
          maxThreads.growThreads,
          growThreadsRemaining
        );

        const securityIncrease = ns.growthAnalyzeSecurity(growThreads, target);
        const weakenThreads = Math.ceil(securityIncrease / weakenEffect);

        ns.exec(growScript, server, growThreads, target, growDelay + delay);
        ns.exec(weakenScript, server, weakenThreads, target, delay);
        growThreadsRemaining -= growThreads;
        delay += baseDelay;
      }
    }

    return {
      server: target,
      status: "growing",
      TTL: Date.now() + weakenTime + delay,
    };
  } else {
    return {
      server: target,
      status: "primed",
      TTL: Date.now(),
    };
  }

  function getMaxThreads(maxRam: number, growThreadsRemaining: number) {
    let growThreads = growThreadsRemaining * growMargin;

    while (growThreads > 0) {
      const securityIncrease = ns.growthAnalyzeSecurity(growThreads);
      const weakenThreads = Math.ceil(
        (securityIncrease / weakenEffect) * weakenMargin
      );
      const totalGrowCost = growThreads * growCost;
      const totalWeakenCost = weakenThreads * weakenCost;
      if (maxRam > totalGrowCost + totalWeakenCost) {
        return { growThreads, weakenThreads };
      }

      growThreads -= 1;
    }

    return undefined;
  }
}
