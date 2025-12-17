import { NS, Person, Server } from "@ns";

type MaxHackValue = {
  growthWeakenThreads: number;
  hackWeakenThreads: number;
  hackThreads: number;
  growhreads: number;
  factor: number;
};

export function getMaxHackValue(
  ns: NS,
  player: Person,
  target: string,
  mockedTarget: Server,
  availableRam: number,
  factor = 0.5
): MaxHackValue | undefined {
  const minFactor = 0.0001;

  if (factor < minFactor) {
    return undefined;
  }

  const growScript = "grow.js";
  const weakenScript = "weaken.js";
  const hackScript = "hack.js";
  const weakenEffect = ns.weakenAnalyze(1);
  const weakenCost = ns.getScriptRam(weakenScript);
  const growCost = ns.getScriptRam(growScript);
  const hackCost = ns.getScriptRam(hackScript);

  const maxMoney = mockedTarget.moneyMax ?? 0;

  const hackThreads = Math.max(
    Math.floor(ns.hackAnalyzeThreads(target, maxMoney * factor)),
    1
  );

  if (hackThreads <= 0) {
    return undefined;
  }

  const hackPerThread = ns.formulas.hacking.hackPercent(
    mockedTarget,
    ns.getPlayer()
  );

  const hackPercentage = hackPerThread * hackThreads;
  const remainingPercentage = Math.max(0, 1 - hackPercentage);

  const mockHackedServer = { ...mockedTarget };
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
      return getMaxHackValue(
        ns,
        player,
        target,
        mockedTarget,
        availableRam,
        factor - 0.1
      );
    }
    return getMaxHackValue(
      ns,
      player,
      target,
      mockedTarget,
      availableRam,
      factor - 0.01
    );
  }

  return {
    growthWeakenThreads,
    hackWeakenThreads,
    hackThreads,
    growhreads: growThreads,
    factor,
  };
}
