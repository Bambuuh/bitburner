import { NS, Person } from "@ns";
import { getMaxHackValue } from "/getMaxHackValue";

export function getBestTarget(
  ns: NS,
  servers: string[],
  player: Person,
  playerServers: string[]
) {
  const hackableServers = servers.filter((server) => {
    if (!ns.hasRootAccess(server)) return false;

    const requiredLevel = ns.getServerRequiredHackingLevel(server);
    const playerLevel = player.skills.hacking;
    if (playerLevel < requiredLevel) return false;

    const maxMoney = ns.getServerMaxMoney(server);
    if (maxMoney <= 0) return false;

    return true;
  });

  const homeRam = ns.getServerMaxRam("home");
  const purchasedRam = ns.getServerMaxRam(playerServers[0]);

  const maxRam = homeRam > purchasedRam ? homeRam : purchasedRam;

  const serverScores = hackableServers.map((server) => {
    const mockedServer = ns.getServer(server);
    mockedServer.hackDifficulty = mockedServer.minDifficulty;
    mockedServer.moneyAvailable = mockedServer.moneyMax ?? 0;

    const weakenTime = ns.formulas.hacking.weakenTime(mockedServer, player);
    const hackChance = ns.formulas.hacking.hackChance(mockedServer, player);

    const x = getMaxHackValue(ns, player, server, mockedServer, maxRam);

    let moneyPerMs = 0;

    if (x) {
      const batchTime = 200 + weakenTime;
      const moneyHacked = mockedServer.moneyAvailable * x.factor;
      moneyPerMs = hackChance == 1 ? moneyHacked / batchTime : 0;
    }

    return {
      server,
      moneyPerMs,
    };
  });

  serverScores.sort((a, b) => b.moneyPerMs - a.moneyPerMs);

  return serverScores.length > 0 ? serverScores[0].server : "";
}
