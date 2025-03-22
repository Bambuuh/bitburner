import { NS } from "@ns";
import { primeTarget } from "/batch/primeTarget";
import { hackTarget } from "/batch/hackTarget";

export function batchHandler(
  ns: NS,
  primedServers: string[],
  serversBeingPrimed: PrimeCandidate[],
  purchasedServers: string[],
  targets: ValueTarget[]
) {
  const servers: string[] = ["home", ...purchasedServers];
  for (const target of targets) {
    const isPriming = serversBeingPrimed.some(
      (primed) => primed.server === target.server
    );

    if (isPriming) {
      continue;
    }

    const isPrimed = primedServers.includes(target.server);

    if (!isPrimed) {
      const res = primeTarget(ns, target, servers);
      if (res.status === "primed") {
        primedServers.push(target.server);
      } else {
        serversBeingPrimed.push(res);
      }
    } else {
      hackTarget(ns, target.server, servers);
    }
  }
}
