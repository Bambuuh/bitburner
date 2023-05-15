import { NS } from "@ns";

type Props = {
  ns: NS;
  server: string;
  playerHackLevel: number;
};

export function canHack({ ns, server, playerHackLevel }: Props): boolean {
  return (
    !ns.hasRootAccess(server) &&
    ns.getServerNumPortsRequired(server) === 0 &&
    ns.getServerRequiredHackingLevel(server) <= playerHackLevel
  );
}
