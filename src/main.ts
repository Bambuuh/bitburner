import { NS } from "@ns";
import { batchHandler } from "/batch/batchHandler";
// import { getHackingValueList } from "/utils/getHackingValueList";
import { getBestTarget } from "./bestHackTarget";
import { getHackableServers } from "/utils/getHackableServers";
import { manageServers } from "/utils/manageServers";

export async function main(ns: NS): Promise<void> {
  const primedServers: string[] = [];
  let serversBeingPrimed: PrimeCandidate[] = [];
  // const homeRam = ns.getServerMaxRam("home");

  let currentTarget = undefined;

  while (true) {
    serversBeingPrimed = serversBeingPrimed.filter((prime) => {
      if (prime.TTL <= Date.now()) {
        // ns.tprint(`${prime.server} is done ${prime.status}`);
        return false;
      }
      return true;
    });
    const purchasedServers = ns.getPurchasedServers();
    const player = ns.getPlayer();

    const hackableServers = getHackableServers(ns, player);
    const bestTarget = getBestTarget(ns, hackableServers, player) ?? "n00dles";

    if (currentTarget !== bestTarget) {
      ns.tprint(`New target ${bestTarget}`);
      currentTarget = bestTarget;
    }

    // if (homeRam >= 128) {
    manageServers(ns, player, purchasedServers);

    batchHandler(
      ns,
      primedServers,
      serversBeingPrimed,
      purchasedServers,
      bestTarget
    );
    // } else {
    //   manageServers(ns, player, purchasedServers);
    //   batchHandler(
    //     ns,
    //     primedServers,
    //     serversBeingPrimed,
    //     purchasedServers,
    //     "n00dles"
    //   );
    // }

    await ns.sleep(1000);
  }
}
