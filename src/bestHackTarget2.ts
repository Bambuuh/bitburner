import { NS } from "@ns";
import { batchTargetValue } from "./bestBatchTarget";
import { canBatch } from "./canBatchFn";
import { getMockServer } from "./getMockServer";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS) {
  const usableServers = getUsableServers(ns);
  const player = ns.getPlayer();
  const isBatching = ns.args[0] as boolean;

  const hackableServers = usableServers.filter((server) => {
    const requiredHackLevel = ns.getServerRequiredHackingLevel(server);
    const mockServer = getMockServer(ns, server);

    return (
      server !== "home" &&
      !server.startsWith("server-") &&
      requiredHackLevel <= player.skills.hacking &&
      ns.formulas.hacking.hackChance(mockServer, player) === 1
    );
  });

  if (hackableServers.length === 0) {
    hackableServers.push("n00dles");
  }

  const scores = [];

  for (const server of hackableServers) {
    if (isBatching) {
      scores.push(batchTargetValue(ns, server));
      continue;
    }

    const batchData = canBatch(ns, server);
    const mockServer = getMockServer(ns, server);
    if (batchData || server === "n00dles") {
      const score =
        ((mockServer.moneyMax ?? 1) *
          ns.formulas.hacking.hackChance(mockServer, player)) /
        ns.formulas.hacking.weakenTime(mockServer, player);
      scores.push({ server, score });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  ns.write("bestTarget.txt", scores[0]?.server || "n00dles", "w");
}
