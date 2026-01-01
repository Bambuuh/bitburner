import { NS } from "@ns";
import { ceasar } from "./contracts/ceasar";
import { hammingCodes } from "/contracts/hammingCodes";

export async function main(ns: NS) {
  const visited = new Set();

  // Recursive function to explore servers
  function findContracts(server: string) {
    // Skip if we've already visited this server
    if (visited.has(server)) return;

    // Mark server as visited
    visited.add(server);

    // Check for contracts on this server
    const contracts = ns.ls(server, ".cct");
    if (contracts.length > 0) {
      ns.tprint(`Contracts found on ${server}:`);
      for (const contract of contracts) {
        ns.tprint(`- ${contract}`);
        ns.tprint(`- ${ns.codingcontract.getContractType(contract, server)}`);
        const data = ns.codingcontract.getData(contract, server);
        if (
          ns.codingcontract.getContractType(contract, server) ===
          "HammingCodes: Encoded Binary to Integer"
        ) {
          const res = hammingCodes(data);
          ns.tprint(data);
          ns.tprint(res);
          // const reward = ns.codingcontract.attempt(res, contract, server);
          // if (reward.length > 0) {
          //   ns.tprint("REWARD", reward);
          // } else {
          //   ns.tprint("FAIL", reward);
          // }
        }
        if (
          ns.codingcontract.getContractType(contract, server) ===
          "Encryption I: Caesar Cipher"
        ) {
          const res = ceasar(data[0], data[1]);
          const reward = ns.codingcontract.attempt(res, contract, server);
          if (reward.length > 0) {
            ns.tprint("REWARD", reward);
          } else {
            ns.tprint("FAIL", reward);
          }
        }
      }
    }

    // Get all connected servers
    const connectedServers = ns.scan(server);

    // Recursively explore each connected server
    for (const connectedServer of connectedServers) {
      if (!visited.has(connectedServer)) {
        findContracts(connectedServer);
      }
    }
  }

  // Start the recursive search from home
  findContracts("home");
}
