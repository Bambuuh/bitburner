import { NS } from "@ns";
import { isAtNeurofluxMax } from "./getNerufluxLevel";
import { hasDoneFaction } from "./hasDoneFaction";
import { PORTS } from "./PORTS";

export async function main(ns: NS): Promise<void> {
  const isServersMaxedOut = ns
    .getPurchasedServers()
    .every(
      (server) => ns.getServerMaxRam(server) === ns.getPurchasedServerMaxRam()
    );
  if (
    hasDoneFaction(ns, "Daedalus") &&
    isServersMaxedOut &&
    isAtNeurofluxMax(ns)
  ) {
    ns.writePort(PORTS.startExpFarm, true);
  }
}
