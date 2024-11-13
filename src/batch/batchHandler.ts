import { NS } from "@ns";
import { primeTarget } from "/batch/primeTarget";
import { hackTarget } from "/batch/hackTarget";

export function batchHandler(
  ns: NS,
  primedServers: string[],
  purchasedServers: string[],
  targets: ValueTarget[]
) {
  const servers: string[] = ["home", ...purchasedServers];
  for (const target of targets) {
    if (!primedServers.includes(target.server)) {
      const primed = primeTarget(ns, target.server, servers);
      if (primed) {
        primedServers.push(target.server);
      }
    } else {
      hackTarget(ns, target.server, servers);
    }
  }
}
