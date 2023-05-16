import { NS } from "@ns";

export function main(ns: NS): void {
  const target = ns.args[0] as string;
  const hosts = ns.scan();
  for (const host of hosts) {
    hosts.push(...ns.scan(host).slice(1));
  }

  const found = hosts.find((x) => x.includes(target));

  const path = [];

  if (found) {
    path.push(found);
  }

  for (let i = 0; path[i] != "home"; i++) {
    path.push(ns.scan(path[i])[0]);
  }
  ns.tprint(path.reverse().join(" > "));
}
