import { NS } from "@ns";
import { findLargestFactor } from "./contracts/findLargestPrime";

function trySolveContract(ns: NS, filename: string, server: string): void {
  const type = ns.codingcontract.getContractType(filename, server);
  if (type === "Find Largest Prime Factor") {
    const data = ns.codingcontract.getData(filename, server);
    const factor = findLargestFactor(data);
    const res = ns.codingcontract.attempt(factor, filename, server);

    if (res.length > 0) {
      ns.tprint("solved contract");
    }
  }
}

export async function main(ns: NS): Promise<void> {
  const servers = ns.scan();

  for (let i = 0; i < servers.length; i++) {
    const nestedServers = ns.scan(servers[i]);
    nestedServers.forEach((server) => {
      if (servers.every((s) => s !== server)) {
        servers.push(server);
      }
    });
  }

  const hackableServers: string[] = servers.filter(
    (server) =>
      ns.hasRootAccess(server) &&
      !server.startsWith("server") &&
      server !== "home"
  );

  hackableServers.forEach((server) => {
    const files = ns.ls(server, ".cct");

    if (files.length > 0) {
      files.forEach((f) => trySolveContract(ns, f, server));
    }
  });
}
