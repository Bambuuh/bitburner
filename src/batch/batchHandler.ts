import { NS } from "@ns";
import { primeTarget } from "/batch/primeTarget";
import { hackTarget } from "/batch/hackTarget";

export function batchHandler(
  ns: NS,
  primedServers: string[],
  serversBeingPrimed: PrimeCandidate[],
  purchasedServers: string[],
  target: string
) {
  const servers: string[] = ["home", ...purchasedServers];
  const isPriming = serversBeingPrimed.some(
    (primed) => primed.server === target
  );

  if (isPriming) {
    return;
  }

  const isPrimed = primedServers.includes(target);

  if (!isPrimed) {
    const res = primeTarget(ns, target, servers);
    if (res.status === "primed") {
      primedServers.push(target);
    } else {
      serversBeingPrimed.push(res);
    }
  } else {
    hackTarget(ns, target, servers);
  }
}
