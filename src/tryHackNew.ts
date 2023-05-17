import { NS } from "@ns";

export function tryNukeNewServers(ns: NS, servers: string[]): string[] {
  const playerHackLevel = ns.getHackingLevel();
  const nuked: string[] = [];

  const portsAvailable: string[] = [];

  const hasBrute = ns.fileExists("BruteSSH.exe");
  const hasFtpCrack = ns.fileExists("FTPCrack.exe");
  const hasHttpWorm = ns.fileExists("HTTPWorm.exe");
  const hasRelaySmtp = ns.fileExists("relaySMTP.exe");

  if (hasBrute) {
    portsAvailable.push("BruteSSH.exe");
  }

  if (hasFtpCrack) {
    portsAvailable.push("FTPCrack.exe");
  }

  if (hasHttpWorm) {
    portsAvailable.push("HTTPWorm.exe");
  }

  if (hasRelaySmtp) {
    portsAvailable.push("relaySMTP.exe");
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
      if (hasFtpCrack) {
        ns.ftpcrack(server);
      }
      if (hasHttpWorm) {
        ns.httpworm(server);
      }
      if (hasRelaySmtp) {
        ns.relaysmtp(server);
      }
      ns.nuke(server);
      ns.tprint("Nuked ", server);
      nuked.push(server);
    }
  });

  return nuked;
}
