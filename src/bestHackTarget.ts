import { NS } from "@ns";
import { getUsableServers } from "./getUsableServers";
import { getMaxHackValue } from "/getMaxHackValue";

export async function main(ns: NS) {
  const player = ns.getPlayer();
  const playerServers = getUsableServers(ns);

  const hackableServers = playerServers.filter(
    (server) => server !== "home" && !server.startsWith("server-")
  );

  const homeRam = ns.getServerMaxRam("home");
  const purchasedRam = ns.getServerMaxRam(playerServers[0]);

  const maxRam = homeRam > purchasedRam ? homeRam : purchasedRam;

  const serverScores = hackableServers.map((server) => {
    const mockedServer = ns.getServer(server);
    mockedServer.hackDifficulty = mockedServer.minDifficulty;
    mockedServer.moneyAvailable = mockedServer.moneyMax ?? 0;

    // const weakenTime = ns.formulas.hacking.weakenTime(mockedServer, player);
    // const hackChance = ns.formulas.hacking.hackChance(mockedServer, player);

    const weakenTime = ns.getWeakenTime(server);
    const hackChance = ns.hackAnalyzeChance(server);

    const maxValue = getMaxHackValue(ns, player, server, mockedServer, maxRam);

    let moneyPerMs = 0;

    if (maxValue) {
      const batchTime = 200 + weakenTime;
      const moneyHacked = mockedServer.moneyAvailable * maxValue.factor;
      moneyPerMs = hackChance == 1 ? moneyHacked / batchTime : 0;
    }

    return {
      server,
      moneyPerMs,
    };
  });

  serverScores.sort((a, b) => b.moneyPerMs - a.moneyPerMs);

  const bestTarget =
    serverScores.length > 0 ? serverScores[0].server : "n00dles";

  ns.write("bestTarget.txt", bestTarget, "w");
}
