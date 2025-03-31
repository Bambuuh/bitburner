import { NS } from "@ns";
import { batchHandler } from "/batch/batchHandler";
import { getBestTarget } from "./bestHackTarget";
import { getHackableServers } from "/utils/getHackableServers";
import { manageServers } from "/utils/manageServers";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  const primedServers: string[] = [];
  let serversBeingPrimed: PrimeCandidate[] = [];
  let currentTarget = "n00dles";
  let nextBatchStart: number | undefined = new Date().getTime();
  let nextTargetCooldown = new Date().getTime();
  const tenMinutes = 1000 * 60 * 10;

  while (true) {
    serversBeingPrimed = serversBeingPrimed.filter((prime) => {
      if (prime.TTL <= Date.now()) {
        return false;
      }
      return true;
    });
    const purchasedServers = ns.getPurchasedServers();
    const player = ns.getPlayer();

    const hackableServers = getHackableServers(ns, player);
    const isAllServersSmall = purchasedServers.every(
      (server) => ns.getServerMaxRam(server) < 128
    );
    const bestTarget = isAllServersSmall
      ? "n00dles"
      : getBestTarget(ns, hackableServers, player, purchasedServers) ??
        "n00dles";

    if (
      currentTarget !== bestTarget &&
      new Date().getTime() > nextTargetCooldown
    ) {
      ns.tprint(`New target ${bestTarget}`);
      currentTarget = bestTarget;
      nextTargetCooldown = new Date().getTime() + tenMinutes;
    }

    manageServers(ns, player, purchasedServers);

    nextBatchStart = await batchHandler(
      ns,
      primedServers,
      serversBeingPrimed,
      purchasedServers,
      currentTarget,
      nextBatchStart
    );

    await ns.sleep(1000);
  }
}
