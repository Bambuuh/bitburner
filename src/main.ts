import { NS } from "@ns";
import { batchHandler } from "/batch/batchHandler";
import { getBestTarget } from "./bestHackTarget";
import { getHackableServers } from "/utils/getHackableServers";
import { manageServers } from "/utils/manageServers";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  const primedServers: string[] = [];
  let serversBeingPrimed: PrimeCandidate[] = [];

  let currentTarget = undefined;

  let nextBatchStart: number | undefined = new Date().getTime();

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
      : getBestTarget(ns, hackableServers, player) ?? "n00dles";

    // const bestTarget = "n00dles";

    if (currentTarget !== bestTarget) {
      ns.tprint(`New target ${bestTarget}`);
      currentTarget = bestTarget;
    }

    manageServers(ns, player, purchasedServers);

    nextBatchStart = await batchHandler(
      ns,
      primedServers,
      serversBeingPrimed,
      purchasedServers,
      bestTarget,
      nextBatchStart
    );

    // ns.tprint(
    //   `NEXT BATCH IN ${
    //     ((nextBatchStart ?? new Date().getTime()) - new Date().getTime()) / 1000
    //   } seconds`
    // );

    await ns.sleep(1000);
  }
}
