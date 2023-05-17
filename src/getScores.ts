import { NS } from "@ns";
import { getServerScore } from "./score";

export function getScores(
  ns: NS,
  servers: string[]
): { server: string; score: number }[] {
  const scores = servers
    .map((server) => ({
      server,
      score: getServerScore({
        object_netscript: ns,
        string_server: server,
      }),
    }))
    .sort((a, b) => b.score - a.score);

  return scores;
}
