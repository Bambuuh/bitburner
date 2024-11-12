import { NS } from "@ns";

import { getHackingValue } from "/utils/getHackingValue";
import { getHackableServers } from "/utils/getHackableServers";
import { getServersToPrep } from "/utils/getServersToPrep";
import { batchHack } from "/batch/batchHack";
import { batchPrepp } from "/batch/batchPrep";
import { manageServers } from "./manageServers";

type ValueServer = {
  name: string;
  hackingValue: {
    value: number;
    requiredRam: number;
  };
};

export async function main(ns: NS): Promise<void> {
  let target: { server: string; hackChance: number } | undefined = undefined;
  const serversBeingPrepped: { target: string; TTL: number }[] = [];
  const batchInterval = 50;
  setupScripts(ns);

  while (true) {
    manageServers(ns);
    const hackableServers = getHackableServers(ns);
    const serversToCheck = hackableServers.filter(
      (server) =>
        server !== "home" &&
        server !== target?.server &&
        serversBeingPrepped.every((prep) => prep.target !== server)
    );

    const serversToPrep = getServersToPrep(ns, serversToCheck);

    serversToPrep.forEach((server) => {
      const newPreppServer = batchPrepp(ns, server);
      if (newPreppServer) {
        const index = serversBeingPrepped.push(newPreppServer);
        setTimeout(() => {
          serversBeingPrepped.splice(index - 1, 1);
        }, newPreppServer.TTL);
      }
    });

    if (serversBeingPrepped.length === 0) {
      if (target) {
        serversToCheck.push(target.server);
      }
      const valueServers = serversToCheck.map((server) => ({
        name: server,
        hackingValue: getHackingValue(ns, server, target),
      }));

      const maxRam = getMaxAvailableRam(ns);
      const mostValuedServer = valueServers.reduce<ValueServer | undefined>(
        (best, server) => {
          if (
            !best ||
            (best.hackingValue.value < server.hackingValue.value &&
              server.hackingValue.requiredRam <= maxRam)
          ) {
            return server;
          }
          return best;
        },
        undefined
      );

      if (
        mostValuedServer &&
        ((mostValuedServer?.name && !target) ||
          mostValuedServer.name !== target?.server)
      ) {
        ns.tprint(`Targeting ${mostValuedServer?.name}`);
        target = {
          hackChance: ns.hackAnalyzeChance(mostValuedServer?.name),
          server: mostValuedServer?.name,
        };
      }

      if (target) {
        const optimalHackPercentage = Math.min(
          0.5,
          ns.hackAnalyze(target.server) / 2
        );
        const hackPercentage = Math.max(0.2, optimalHackPercentage); // Set a minimum to ensure continuous hacking

        batchHack(ns, target.server, hackPercentage);
      }
    }
    await ns.sleep(batchInterval);
  }
}

function setupScripts(ns: NS) {
  const servers = ns.getPurchasedServers();
  const scripts = ["hack.js", "grow.js", "weaken.js"];

  for (const server of servers) {
    for (const script of scripts) {
      if (!ns.fileExists(script, server)) {
        ns.scp(script, server);
      }
    }
  }
}

function getMaxAvailableRam(ns: NS) {
  const purchasedServers = ns.getPurchasedServers();
  const homeRam = ns.getServerMaxRam("home");
  const maxPurchased = purchasedServers.reduce(
    (max, server) => Math.min(max, ns.getServerMaxRam(server)),
    Infinity
  );
  return Math.max(homeRam, maxPurchased);
}
