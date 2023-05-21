import { NS } from "@ns";
import { GROW_SEC, HACK_SEC, WEAKEN_SEC } from "./constants";

type ServerScore = {
  server: string;
  score: number;
};

export function getScores(
  ns: NS,
  targets: string[],
  playerServers: string[]
): ServerScore[] {
  const scores: ServerScore[] = [];
  const hackScriptCost = ns.getScriptRam("hack.js");
  const weakenScriptCost = ns.getScriptRam("weaken.js");
  const growScriptCost = ns.getScriptRam("grow.js");

  let serversToCheck = playerServers;

  const homeRam = ns.getServerMaxRam("home");
  const isHomeSmallest = playerServers
    .filter((s) => s !== "home")
    .every((s) => {
      const ram = ns.getServerMaxRam(s);
      return homeRam < ram;
    });

  if (isHomeSmallest) {
    serversToCheck = playerServers.filter((s) => s !== "home");
  }

  const smallestServer = serversToCheck.reduce(
    (smallest, server) => {
      const maxRam = ns.getServerMaxRam(server);
      if (maxRam < smallest.maxRam) {
        return { server, maxRam };
      }
      return smallest;
    },
    { server: "", maxRam: Number.MAX_SAFE_INTEGER }
  );

  targets.forEach((t) => {
    const maxMoney = ns.getServerMaxMoney(t);

    const moneyToSteal = Math.floor(maxMoney * 0.005);

    if (moneyToSteal > 1) {
      const hackThreads = Math.ceil(ns.hackAnalyzeThreads(t, moneyToSteal));
      const hackCost = hackThreads * hackScriptCost;
      const hackSecurityIncrease = hackThreads * HACK_SEC;

      const hackWeakenThreads = Math.ceil(hackSecurityIncrease / WEAKEN_SEC);
      const hackWeakenCost = Math.ceil(weakenScriptCost * hackWeakenThreads);

      const growThreads = Math.ceil(ns.growthAnalyze(t, moneyToSteal));
      const growCost = Math.ceil(growScriptCost * growThreads);
      const growSecurityIncrease = growThreads * GROW_SEC;

      const growWeakenThreads = Math.ceil(growSecurityIncrease / WEAKEN_SEC);
      const growWeakenCost = Math.ceil(weakenScriptCost * growWeakenThreads);

      const totalCost = Math.ceil(
        hackCost + hackWeakenCost + growCost + growWeakenCost
      );

      if (smallestServer.maxRam >= totalCost) {
        const minSecurity = ns.getServerMinSecurityLevel(t);
        scores.push({
          score: maxMoney / minSecurity,
          server: t,
        });
      }
    }
  });

  scores.sort((a, b) => b.score - a.score);

  return scores;
}
