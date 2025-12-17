import { NS } from "@ns";
import { primeTarget } from "/batch/primeTarget";
import { hackTarget } from "/batch/hackTarget";

export async function batchHandler(
  ns: NS,
  primedServers: string[],
  serversBeingPrimed: PrimeCandidate[],
  purchasedServers: string[],
  target: string,
  nextBatchStart = new Date().getTime()
): Promise<number | undefined> {
  const servers: string[] = ["home", ...purchasedServers];
  const isPriming = serversBeingPrimed.some(
    (primed) => primed.server === target
  );

  if (isPriming) {
    return undefined;
  }

  const isPrimed = primedServers.includes(target);

  if (!isPrimed) {
    const res = primeTarget(ns, target, servers);
    if (res.status === "primed") {
      primedServers.push(target);
    } else {
      serversBeingPrimed.push(res);
    }
    return undefined;
  } else {
    return await hackTarget(ns, target, servers, nextBatchStart);
  }
}
