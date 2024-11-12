import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0] as string;

  if (!target) {
    ns.tprint("Please specify a target server name as an argument.");
    return;
  }

  const paths = new Map<string, string[]>();
  paths.set("home", ["home"]);

  function mapServers(current: string, parent: string | null): void {
    const connections = ns.scan(current);
    connections.forEach((next) => {
      if (next === parent) return;
      const path = paths.get(current) || [];
      paths.set(next, [...path, next]);
      mapServers(next, current);
    });
  }

  mapServers("home", null);

  if (!paths.has(target)) {
    ns.tprint(`Server '${target}' not found in the network.`);
    return;
  }

  const path = paths.get(target);

  if (path) {
    ns.tprint(`Path to ${target}: ${path.join(" -> ")}`);
  } else {
    ns.tprint(`Could not determine path to ${target}.`);
  }
}
