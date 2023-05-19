import { NS } from "@ns";
import { tryNukeNewServers } from "./tryHackNew";
import { tryPurchaseNewServers } from "./tryPurchaseNewServers";
import { weakenAllServers } from "./weakenAllServers";
import { growAllServers } from "./growAllServers";
import { getUpdateFromPort } from "./getUpdateFromPort";
import { getScores } from "./getScores";
import { batch } from "./batch";

export async function main(ns: NS): Promise<void> {
  const servers = ns.scan();

  for (let i = 0; i < servers.length; i++) {
    const nestedServers = ns.scan(servers[i]);
    nestedServers.forEach((server) => {
      if (servers.every((s) => s !== server)) {
        servers.push(server);
      }
    });
  }

  const hackableServers: string[] = servers.filter(
    (server) =>
      ns.hasRootAccess(server) &&
      !server.startsWith("server") &&
      server !== "home"
  );

  let lastOptimalTarget = "";
  let optimalTarget = "";

  let serversBeingWeakened: string[] = [];
  let serversBeingGrown: string[] = [];
  let primedServers: string[] = [];
  while (true) {
    const updatedWeakening = getUpdateFromPort(ns, serversBeingWeakened, 1);
    const updatedGrowing = getUpdateFromPort(ns, serversBeingWeakened, 2);

    serversBeingWeakened = updatedWeakening;
    serversBeingGrown = updatedGrowing;

    const nuked = tryNukeNewServers(ns, servers);
    hackableServers.push(...nuked);

    tryPurchaseNewServers(ns);

    const playerServers = ["home"];
    playerServers.push(...ns.getPurchasedServers());

    const serversToPrep = hackableServers.filter((server) =>
      serversBeingWeakened.every((s) => s !== server)
    );

    const weakening = weakenAllServers(ns, playerServers, serversToPrep);
    serversBeingWeakened.push(...weakening);

    const serversToGrow = hackableServers.filter((server) =>
      serversBeingWeakened.every((s) => s !== server)
    );

    const { growing, primed } = growAllServers(
      ns,
      playerServers,
      serversToGrow
    );

    serversBeingGrown.push(...growing);
    primedServers = primed;

    if (primed.length === 0) {
      await ns.sleep(1000);
      continue;
    }

    const scores = getScores(ns, primedServers);

    const noViableTargets = scores.every((s) => s.score < 0);

    if (noViableTargets) {
      await ns.sleep(1000);
      continue;
    }

    lastOptimalTarget = optimalTarget;
    optimalTarget = scores.reduce((best, server) => {
      if (server.score > best.score) {
        return server;
      }

      return best;
    }, scores[0]).server;

    if (optimalTarget != lastOptimalTarget) {
      ns.tprint("Changing target to: ", optimalTarget);
    }

    batch(ns, optimalTarget, playerServers);

    await ns.sleep(1000);
  }
}
