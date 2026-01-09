import { NS } from "@ns";
import { arrayJumpingGame } from "./contracts/arrayJumpingGame";
import { ceasar } from "./contracts/ceasar";
import { shortestPathInAGrid } from "./contracts/shortestPathInAGrid";
import { hammingCodes } from "/contracts/hammingCodes";

export async function main(ns: NS) {
  const visited = new Set();

  function attempt(res: string, contract: string, server: string) {
    const reward = ns.codingcontract.attempt(res, contract, server);
    if (reward.length > 0) {
      ns.tprint("REWARD", reward);
    } else {
      ns.tprint("FAIL", contract);
    }
  }

  function findContracts(server: string) {
    if (visited.has(server)) {
      return;
    }

    visited.add(server);

    const contracts = ns.ls(server, ".cct");
    if (contracts.length > 0) {
      ns.tprint(`Contracts found on ${server}:`);
      for (const contract of contracts) {
        const contractType = ns.codingcontract.getContractType(
          contract,
          server
        );
        ns.tprint(`- ${contract}`);
        ns.tprint(`- ${contractType}`);
        const data = ns.codingcontract.getData(contract, server);
        if (contractType === "HammingCodes: Encoded Binary to Integer") {
          // const res = hammingCodes(data);
          // attempt(res, contract, server);
        }
        if (contractType === "Encryption I: Caesar Cipher") {
          const res = ceasar(data[0], data[1]);
          attempt(res, contract, server);
        }
        if (contractType === "Square Root") {
          // const res = squareRoot(data);
          // attempt(String(res), contract, server);
        }
        if (contractType === "Total Ways to Sum II") {
          // TODO: implement Total Ways to Sum II contract solver
        }
        if (contractType === "Array Jumping Game") {
          // const res = arrayJumpingGame(data);
          // attempt(String(res), contract, server);
        }
        if (contractType === "Shortest Path in a Grid") {
          const res = shortestPathInAGrid(data);
          attempt(String(res), contract, server);
        }
      }
    }

    const connectedServers = ns.scan(server);

    for (const connectedServer of connectedServers) {
      if (!visited.has(connectedServer)) {
        findContracts(connectedServer);
      }
    }
  }

  findContracts("home");
}
