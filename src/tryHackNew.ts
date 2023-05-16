import { NS } from "@ns";

export function tryNukeNewServers(ns: NS, servers: string[]): string[] {
  const playerHackLevel = ns.getHackingLevel();
  const nuked: string[] = [];

  const portsAvailable: string[] = [];

  const hasBrute = ns.fileExists("BruteSSH.exe");

  if (hasBrute) {
    portsAvailable.push("BruteSSH.exe");
  }

  servers.forEach((server) => {
    const canHack =
      !ns.hasRootAccess(server) &&
      ns.getServerNumPortsRequired(server) <= portsAvailable.length &&
      ns.getServerRequiredHackingLevel(server) <= playerHackLevel;

    if (canHack) {
      if (hasBrute) {
        ns.brutessh(server);
      }
      ns.nuke(server);
      ns.tprint("Nuked ", server);
      nuked.push(server);
    }
  });

  return nuked;
}
