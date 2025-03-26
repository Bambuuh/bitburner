import { NS } from "@ns";
import { getServerAvailableRam } from "/utils/getServerAvailableRam";

type MaxHackValue = {
  growthWeakenThreads: number;
  hackWeakenThreads: number;
  hackThreads: number;
  growhreads: number;
};

export async function hackTarget(
  ns: NS,
  target: string,
  servers: string[],
  nextBatchStart = new Date().getTime()
) {
  const maxMoney = ns.getServerMaxMoney(target);

  if (maxMoney === 0) {
    return 0;
  }

  const mockedServer = ns.getServer(target);
  const player = ns.getPlayer();

  mockedServer.hackDifficulty = mockedServer.minDifficulty;
  mockedServer.moneyAvailable = mockedServer.moneyMax;

  const growScript = "grow.js";
  const weakenScript = "weaken.js";
  const hackScript = "hack.js";
  const weakenCost = ns.getScriptRam(weakenScript);
  const growCost = ns.getScriptRam(growScript);
  const hackCost = ns.getScriptRam(hackScript);
  const weakenEffect = ns.weakenAnalyze(1);
  const hackTime = Math.ceil(
    ns.formulas.hacking.hackTime(mockedServer, player)
  );
  const growTime = Math.ceil(
    ns.formulas.hacking.growTime(mockedServer, player)
  );
  const weakenTime = Math.ceil(
    ns.formulas.hacking.weakenTime(mockedServer, player)
  );

  const baseDelay = 100;
  const hackWeakenDelay = 0;
  const hackDelay = weakenTime - hackTime - baseDelay;
  const growDelay = weakenTime - growTime + baseDelay;
  const growWeakenDelay = 2 * baseDelay;

  // ns.tprint("hack duration", hackDelay + hackTime);
  // ns.tprint("hack weaken duration", hackWeakenDelay + weakenTime);
  // ns.tprint("grow duration", growDelay + growTime);
  // ns.tprint("grow weaken duration", growWeakenDelay + weakenTime);

  // ns.print(
  //   `Security: ${ns.getServerSecurityLevel(
  //     target
  //   )} (min: ${ns.getServerMinSecurityLevel(target)})`
  // );

  // const initialDelay = Math.max(0, nextBatchStart - new Date().getTime());

  // let delay = 0;
  // const maxBatchDelay = growWeakenDelay + weakenTime; // Time for a complete batch cycle

  // const servers2 = ["home"];
  // let batchStartTime = Math.max(Date.now(), nextBatchStart) + delay;
  let batchStartTime = Math.max(Date.now(), nextBatchStart);

  for (const server of servers) {
    // for (const server of servers2) {
    let availableRam = getServerAvailableRam(ns, server);
    let res = getMaxHackValue(availableRam);

    while (res) {
      const {
        growhreads: growThreads,
        growthWeakenThreads,
        hackThreads,
        hackWeakenThreads,
      } = res;

      if (
        hackThreads <= 0 ||
        growThreads <= 0 ||
        hackWeakenThreads <= 0 ||
        growthWeakenThreads <= 0
      ) {
        break;
      }

      // Calculate when this batch should start to avoid long waiting times

      // Execute the batch
      ns.exec(
        hackScript,
        server,
        hackThreads,
        target,
        hackDelay,
        batchStartTime
      );

      ns.exec(
        weakenScript,
        server,
        hackWeakenThreads,
        target,
        hackWeakenDelay,
        batchStartTime
      );

      ns.exec(
        growScript,
        server,
        growThreads,
        target,
        growDelay,
        batchStartTime
      );

      ns.exec(
        weakenScript,
        server,
        growthWeakenThreads,
        target,
        growWeakenDelay,
        batchStartTime
      );

      // delay += 3 * baseDelay;
      batchStartTime =
        Math.max(new Date().getTime(), batchStartTime) + 3 * baseDelay;

      // const x = ns.getServer(target);
      // ns.tprint("MONEY", x.moneyAvailable);
      // ns.tprint("SEC", x.hackDifficulty);
      // await ns.sleep(delay + 1000);

      // if (delay > 10000) {
      //   break;
      // }

      // ns.tprint("NEW DELAY " + delay);

      availableRam = getServerAvailableRam(ns, server);
      res = getMaxHackValue(availableRam);
    }
  }

  function getMaxHackValue(
    availableRam: number,
    factor = 0.5
  ): MaxHackValue | undefined {
    const minFactor = 0.0001;

    if (factor < minFactor) {
      return undefined;
    }

    // Calculate hack threads needed for the target percentage of max money
    const hackThreads = Math.floor(
      ns.hackAnalyzeThreads(target, maxMoney * factor)
    );

    // If we can't hack anything meaningful, return undefined
    if (hackThreads <= 0) {
      return undefined;
    }

    const hackPerThread = ns.formulas.hacking.hackPercent(
      mockedServer,
      ns.getPlayer()
    );

    const hackPercentage = hackPerThread * hackThreads;
    const remainingPercentage = Math.max(0, 1 - hackPercentage);

    const mockHackedServer = { ...mockedServer };
    mockHackedServer.moneyAvailable = Math.ceil(
      (mockHackedServer.moneyMax ?? 0) * remainingPercentage
    );

    const weakenMargin = 2;
    const growMargin = 1.5;

    const growThreads = Math.ceil(
      ns.formulas.hacking.growThreads(
        mockHackedServer,
        player,
        mockHackedServer.moneyMax ?? 0
      ) * growMargin
    );

    const growthSecurityIncrease = ns.growthAnalyzeSecurity(growThreads);
    const growthWeakenThreads = Math.max(
      1,
      Math.ceil((growthSecurityIncrease / weakenEffect) * weakenMargin)
    );

    const hackSecurityIncrease = ns.hackAnalyzeSecurity(hackThreads, target);
    const hackWeakenThreads = Math.max(
      1,
      Math.ceil((hackSecurityIncrease / weakenEffect) * weakenMargin)
    );

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

    return {
      growthWeakenThreads,
      hackWeakenThreads,
      hackThreads,
      growhreads: growThreads,
    };
  }

  return nextBatchStart + 3 * baseDelay;
}
