import { NS } from "@ns";
// import { getHackableServers } from "/utils/findServers";

export async function main(ns: NS): Promise<void> {
  const target = "n00dles"; // Target server
  const hackPercentage = 0.1; // Fraction of money to hack per batch
  const batchInterval = 200; // Delay between starting each batch (in milliseconds)

  // const hackableServers = getHackableServers(ns);
  // ns.tprint(hackableServers);

  while (true) {
    batch(ns, target, hackPercentage);
    await ns.sleep(batchInterval); // Start the next batch after a small interval
  }
}

async function batch(ns: NS, target: string, hackPercentage: number) {
  if (hackPercentage <= 0.01) {
    return;
  }

  const hackScript = "hack2.js";
  const growScript = "grow2.js";
  const weakenScript = "weaken2.js";

  const hackTime = ns.getHackTime(target);
  const growTime = ns.getGrowTime(target);
  const weakenTime = ns.getWeakenTime(target);

  const serverMaxMoney = ns.getServerMaxMoney(target);
  const moneyToHack = serverMaxMoney * hackPercentage;
  const hackThreads = Math.floor(ns.hackAnalyzeThreads(target, moneyToHack));
  const growThreads = Math.ceil(
    ns.growthAnalyze(target, serverMaxMoney / (serverMaxMoney - moneyToHack))
  );
  const weakenThreadsHack = Math.ceil((hackThreads * 0.002) / 0.05); // 0.002 sec increase per hack thread, 0.05 reduction per weaken thread
  const weakenThreadsGrow = Math.ceil((growThreads * 0.004) / 0.05); // 0.004 sec increase per grow thread, 0.05 reduction per weaken thread

  const delayHack = weakenTime - hackTime;
  const delayGrow = weakenTime - growTime;
  const delayWeaken = 0;

  const totalRam = ns.getServerMaxRam("home");
  const usedRam = ns.getServerUsedRam("home");
  const availableRam = totalRam - usedRam;
  const hackCost = ns.getScriptRam(hackScript);
  const growCost = ns.getScriptRam(growScript);
  const weakenCost = ns.getScriptRam(weakenScript);
  const totalCost =
    hackCost * hackThreads +
    growCost * growThreads +
    weakenCost * (weakenThreadsGrow + weakenThreadsHack);

  if (totalCost > availableRam) {
    batch(ns, target, hackPercentage - 0.01);
    return;
  }

  if (hackThreads > 0) {
    ns.exec(hackScript, "home", hackThreads, target, delayHack, Date.now());
  }
  if (growThreads > 0) {
    ns.exec(growScript, "home", growThreads, target, delayGrow, Date.now());
  }
  if (weakenThreadsHack > 0) {
    ns.exec(
      weakenScript,
      "home",
      weakenThreadsHack,
      target,
      delayWeaken,
      Date.now()
    );
  }
  if (weakenThreadsGrow > 0) {
    ns.exec(
      weakenScript,
      "home",
      weakenThreadsGrow,
      target,
      delayWeaken,
      Date.now()
    );
  }
}
