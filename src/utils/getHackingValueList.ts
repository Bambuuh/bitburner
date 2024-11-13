import { NS } from "@ns";

export function getHackingValueList(ns: NS, servers: string[]) {
  const mapped = servers.map<ValueTarget>((server) => ({
    value: getHackingValue(ns, server),
    server,
  }));

  mapped.sort((a, b) => b.value - a.value);

  return mapped.slice(0, 5);
}

export function getHackingValue(ns: NS, server: string) {
  const maxMoney = ns.getServerMaxMoney(server);
  const serverGrowth = ns.getServerGrowth(server);
  const growthTime = ns.getGrowTime(server);
  const hackTime = ns.getHackTime(server);

  return (maxMoney * serverGrowth) / growthTime / hackTime;
}
