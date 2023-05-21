import { NS } from "@ns";
import { findLargestFactor } from "./contracts/findLargestPrime";
import { compressionOne } from "./contracts/compressionOne";

function solve(
  ns: NS,
  type: string,
  data: any,
  filename: string,
  server: string
) {
  let res: any = undefined;
  switch (type) {
    case "Find Largest Prime Factor":
      res = findLargestFactor(data);
      break;
    case "Compression I: RLE Compression":
      res = compressionOne(data);
      break;
    default:
      res = undefined;
  }
  if (res) {
    return ns.codingcontract.attempt(res, filename, server);
  }

  return "nope";
}

function trySolveContract(ns: NS, filename: string, server: string): void {
  const type = ns.codingcontract.getContractType(filename, server);
  ns.tprint("========== CONTRACT ==========");
  ns.tprint(server);
  ns.tprint(type);
  ns.tprint("===============================");
  const data = ns.codingcontract.getData(filename, server);
  const res = solve(ns, type, data, filename, server);
  if (res === "nope") {
    ns.tprint("no contracts to solve");
  } else if (res.length > 0) {
    ns.tprint("SOLVED contract: ", filename, " on ", server);
  } else {
    ns.tprint("FAILED contract: ", filename, " on ", server);
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
