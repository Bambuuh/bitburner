import { NS } from "@ns";
import { hasDoneFaction } from "./hasDoneFaction";
import { PORTS } from "./PORTS";

export async function main(ns: NS): Promise<void> {
  const isServersMaxedOut = ns
    .getPurchasedServers()
    .every(
      (server) => ns.getServerMaxRam(server) === ns.getPurchasedServerMaxRam()
    );
  if (hasDoneFaction(ns, "Daedalus") && isServersMaxedOut) {
    ns.writePort(PORTS.startExpFarm, true);
  }
}
