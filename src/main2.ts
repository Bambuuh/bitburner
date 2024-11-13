import { NS } from "@ns";
import { batchHandler } from "/batch/batchHandler";
import { getHackingValueList } from "/utils/getHackingValueList";
import { getHackableServers } from "/utils/getHackableServers";
import { manageServers } from "/utils/manageServers";

export async function main(ns: NS): Promise<void> {
  const primedServers: string[] = [];

  while (true) {
    const purchasedServers = ns.getPurchasedServers();
    const player = ns.getPlayer();

    manageServers(ns, player, purchasedServers);

    const hackableServers = getHackableServers(ns, player);

    const hackingValueList = getHackingValueList(ns, hackableServers);

    batchHandler(ns, primedServers, purchasedServers, hackingValueList);

    await ns.sleep(50);
  }
}
