import { NS } from "@ns";
import { batchHandler } from "/batch/batchHandler";
import { getHackingValueList } from "/utils/getHackingValueList";
import { getHackableServers } from "/utils/getHackableServers";
import { manageServers } from "/utils/manageServers";

export async function main(ns: NS): Promise<void> {
  const primedServers: string[] = [];
  let serversBeingPrimed: PrimeCandidate[] = [];
  const homeRam = ns.getServerMaxRam("home");

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

    if (homeRam >= 128) {
      manageServers(ns, player, purchasedServers);

      const hackableServers = getHackableServers(ns, player);

      const hackingValueList = getHackingValueList(ns, hackableServers);

      batchHandler(
        ns,
        primedServers,
        serversBeingPrimed,
        purchasedServers,
        hackingValueList
      );
    } else {
      manageServers(ns, player, purchasedServers);
      batchHandler(ns, primedServers, serversBeingPrimed, purchasedServers, [
        { server: "n00dles", value: 1 },
      ]);
    }

    await ns.sleep(1000);
  }
}
