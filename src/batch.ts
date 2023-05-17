import { NS } from "@ns";
import { GROW_SEC, HACK_SEC, WEAKEN_SEC } from "/constants";

export function batch(ns: NS, target: string, playerServer: string[]): void {
  let delayCounter = 0;
  for (let i = 0; i < playerServer.length; i++) {
    const server = playerServer[i];
    const ramAvailable =
      ns.getServerMaxRam(server) - ns.getServerUsedRam(server);

    const money = ns.getServerMoneyAvailable(target);
    const hackScriptCost = ns.getScriptRam("hack.js");
    const weakenScriptCost = ns.getScriptRam("weaken.js");
    const growScriptCost = ns.getScriptRam("grow.js");

    let percentage = 1;
    let done = false;
    while (!done) {
      const moneyToSteal = Math.floor(money * percentage);
      const hackThreads = Math.ceil(
        ns.hackAnalyzeThreads(target, moneyToSteal)
      );
      const hackCost = hackThreads * hackScriptCost;
      const hackSecurityIncrease = hackThreads * HACK_SEC;

      const hackWeakenThreads = Math.ceil(hackSecurityIncrease / WEAKEN_SEC);
      const hackWeakenCost = weakenScriptCost * hackWeakenThreads;

      const growThreads = Math.ceil(ns.growthAnalyze(target, moneyToSteal));
      const growCost = growScriptCost * growThreads;
      const growSecurityIncrease = growThreads * GROW_SEC;

      const growWeakenThreads = Math.ceil(growSecurityIncrease / WEAKEN_SEC);
      const growWeakenCost = weakenScriptCost * growWeakenThreads;

      const totalCost = hackCost + hackWeakenCost + growCost + growWeakenCost;

      if (totalCost <= ramAvailable) {
        const delayMS = 50;
        const batchDelay = delayCounter * 150;

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

        const hackDelay = longest - hackTimeFinal;
        const growDelay = longest - growTimeFinal;
        const weakenHackDelay = longest - weakenHackTimeFinal;
        const weakenGrowDelay = longest - weakenGrowTimeFinal;

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
      } else {
        percentage = percentage - 0.01;
      }

      if (percentage <= 0) {
        done = true;
      }
    }
  }
}
