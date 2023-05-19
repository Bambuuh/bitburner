import { NS } from "@ns";
import { GROW_SEC, HACK_SEC, WEAKEN_SEC } from "/constants";

export function batch(ns: NS, target: string, playerServer: string[]): void {
  let delayCounter = 0;
  for (let i = 0; i < playerServer.length; i++) {
    const server = playerServer[i];
    let ramAvailable = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);

    const money = ns.getServerMoneyAvailable(target);
    const hackScriptCost = ns.getScriptRam("hack.js");
    const weakenScriptCost = ns.getScriptRam("weaken.js");
    const growScriptCost = ns.getScriptRam("grow.js");

    let canBatchMore = true;

    while (canBatchMore) {
      let percentage = 0.9;
      let done = false;

      while (!done) {
        const moneyToSteal = Math.floor(money * percentage);
        const hackThreads = Math.ceil(
          ns.hackAnalyzeThreads(target, moneyToSteal)
        );
        const hackCost = hackThreads * hackScriptCost;
        const hackSecurityIncrease = hackThreads * HACK_SEC;

        const hackWeakenThreads = Math.ceil(hackSecurityIncrease / WEAKEN_SEC);
        const hackWeakenCost = Math.ceil(weakenScriptCost * hackWeakenThreads);

        const growThreads = Math.ceil(ns.growthAnalyze(target, moneyToSteal));
        const growCost = Math.ceil(growScriptCost * growThreads);
        const growSecurityIncrease = growThreads * GROW_SEC;

        const growWeakenThreads = Math.ceil(growSecurityIncrease / WEAKEN_SEC);
        const growWeakenCost = Math.ceil(weakenScriptCost * growWeakenThreads);

        const totalCost = Math.ceil(
          hackCost + hackWeakenCost + growCost + growWeakenCost
        );

        if (totalCost < ramAvailable) {
          const delayMS = 50;
          const batchDelay = delayCounter * (4 * delayMS);

          const growTime = ns.getGrowTime(target);
          const weakenTime = ns.getWeakenTime(target);
          const hackTime = ns.getHackTime(target);

          const hackTimeFinal = hackTime;
          const weakenHackTimeFinal = weakenTime - 1 * delayMS;
          const growTimeFinal = growTime - 2 * delayMS;
          const weakenGrowTimeFinal = weakenTime - 3 * delayMS;

          const longest = Math.max(
            hackTimeFinal,
            weakenHackTimeFinal,
            growTimeFinal,
            weakenGrowTimeFinal
          );

          const hackDelay = Math.ceil(longest - hackTimeFinal);
          const growDelay = Math.ceil(longest - growTimeFinal);
          const weakenHackDelay = Math.ceil(longest - weakenHackTimeFinal);
          const weakenGrowDelay = Math.ceil(longest - weakenGrowTimeFinal);

          if (!ns.fileExists("hack.js", server)) {
            ns.scp("hack.js", server);
            ns.scp("weaken.js", server);
            ns.scp("grow.js", server);
          }

          ns.exec(
            "hack.js",
            server,
            hackThreads,
            target,
            hackDelay + batchDelay,
            false
          );
          ns.exec(
            "weaken.js",
            server,
            hackWeakenThreads,
            target,
            weakenHackDelay + batchDelay,
            false
          );

          ns.exec(
            "grow.js",
            server,
            growThreads,
            target,
            growDelay + batchDelay,
            false
          );

          ns.exec(
            "weaken.js",
            server,
            growWeakenThreads,
            target,
            weakenGrowDelay + batchDelay,
            false
          );

          delayCounter++;
          done = true;
          ramAvailable -= Math.ceil(totalCost);
        } else {
          if (percentage > 0.01) {
            percentage = Math.round((percentage - 0.01) * 100) / 100;
          } else {
            percentage = Math.round((percentage - 0.001) * 1000) / 1000;
          }
        }

        if (percentage <= 0) {
          done = true;
          canBatchMore = false;
        }
      }
    }
  }
}
