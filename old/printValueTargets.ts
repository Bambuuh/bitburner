import { NS } from "@ns";
import { getHackingValueList } from "/utils/getHackingValueList";
import { getHackableServers } from "/utils/getHackableServers";

export async function main(ns: NS): Promise<void> {
  const player = ns.getPlayer();
  const hackableServers = getHackableServers(ns, player);
  const hackingValueList = getHackingValueList(ns, hackableServers);

  hackingValueList.forEach((target) => {
    ns.tprint(`${target.server}: ${target.value}`);
  });
}
