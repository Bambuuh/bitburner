import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const servers = ns.scan();
  const hackingLevel = ns.getHackingLevel();
  servers.forEach((server) => {
    if (server !== "home") {
      const canHack = hackingLevel >= ns.getServerRequiredHackingLevel(server);
      const hasRootAccess = ns.hasRootAccess(server);
      if (
        !hasRootAccess &&
        canHack &&
        ns.getServerNumPortsRequired(server) === 0
      ) {
        ns.nuke(server);
        if (ns.hasRootAccess(server)) {
          ns.tprint(`Opened ${server}`);
        }
      }
    }
  });

  ns.tprint("available servers");
  const availableServers = servers.filter((server) => ns.hasRootAccess(server));
  ns.tprint(availableServers);
}
