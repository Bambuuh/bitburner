import { NS } from "@ns";
import { canHack } from "./helpers/canHack";

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

  const playerHackLevel = ns.getHackingLevel();

  servers.forEach((server) => {
    if (canHack({ ns, playerHackLevel, server })) {
      ns.tprint("CAN HACK: ", server);
    } else {
      ns.tprint("CAN NOT HACK: ", server, " ", playerHackLevel);
    }
  });
}
