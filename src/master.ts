import { NS } from "@ns";
import { tryNukeNewServers } from "./tryHackNew";
import { tryPurchaseNewServers } from "./tryPurchaseNewServers";
import { weakenServers } from "./weakenServers";
import { growServers } from "./growServers";
import { hackServers } from "./hackServers";

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

  let targetedServers: string[] = [];
  while (true) {
    let portEmpty = false;

    while (!portEmpty) {
      const serverToRemove = ns.readPort(1);
      if (serverToRemove === "NULL PORT DATA") {
        portEmpty = true;
      } else {
        targetedServers = targetedServers.filter(
          (server) => server !== serverToRemove
        );
      }
    }

    const nuked = tryNukeNewServers(ns, servers);
    hackableServers.push(...nuked);

    tryPurchaseNewServers(ns);

    const playerServers = ns.getPurchasedServers();
    playerServers.push("home");

    targetedServers = weakenServers(
      ns,
      hackableServers,
      playerServers,
      targetedServers
    );

    targetedServers = growServers(
      ns,
      hackableServers,
      playerServers,
      targetedServers
    );

    targetedServers = hackServers(
      ns,
      hackableServers,
      playerServers,
      targetedServers
    );

    await ns.sleep(1000);
  }
}
