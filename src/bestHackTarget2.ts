import { NS } from "@ns";
import { getUsableServers } from "./getUsableServers";

export async function main(ns: NS) {
  const usableServers = getUsableServers(ns);
  const hackLevel = ns.getHackingLevel();

  const hackableServers = usableServers.filter(
    (server) =>
      server !== "home" &&
      !server.startsWith("server-") &&
      ns.hackAnalyzeChance(server) === 1 &&
      ns.getServerRequiredHackingLevel(server) <= hackLevel / 2
  );

  if (hackableServers.length === 0) {
    hackableServers.push("n00dles");
  }

  const scores = [];

  for (const server of hackableServers) {
    const score = ns.getServerMaxMoney(server) / ns.getWeakenTime(server);
    scores.push({ server, score });
  }

  scores.sort((a, b) => b.score - a.score);
  ns.write("bestTarget.txt", scores[0]?.server || "n00dles", "w");
}
