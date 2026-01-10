import { NS } from "@ns";
import { algorithmicStockTraderI } from "./contracts/algorithmicStockTraderI";
import { arrayJumpingGame } from "./contracts/arrayJumpingGame";
import { ceasar } from "./contracts/ceasar";
import { mergeOverlappingIntervals } from "./contracts/mergeOverlappingIntervals";
import { sanitizeParenthesesInExpression } from "./contracts/sanitizeParenthesesInExpression";
import { shortestPathInAGrid } from "./contracts/shortestPathInAGrid";
import { hammingCodes } from "/contracts/hammingCodes";

export async function main(ns: NS) {
  const silent = ns.args[0] === "silent";
  const visited = new Set();

  function attempt(res: any, contract: string, server: string) {
    const reward = ns.codingcontract.attempt(res, contract, server);
    if (reward.length > 0) {
      ns.tprint("REWARD ", reward);
    } else {
      ns.tprint("FAIL ", contract);
    }
  }

  function findContracts(server: string) {
    if (visited.has(server)) {
      return;
    }

    visited.add(server);

    const contracts = ns.ls(server, ".cct");
    if (contracts.length > 0) {
      if (!silent) {
        ns.tprint(`Contracts found on ${server}:`);
      }
      for (const contract of contracts) {
        const contractType = ns.codingcontract.getContractType(
          contract,
          server
        );
        if (!silent) {
          ns.tprint(`- ${contract}`);
          ns.tprint(`- ${contractType}`);
        }
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
        if (contractType === "Sanitize Parentheses in Expression") {
          const res = sanitizeParenthesesInExpression(data);
          attempt(String(res), contract, server);
        }
        if (contractType === "Algorithmic Stock Trader I") {
          const res = algorithmicStockTraderI(data);
          attempt(String(res), contract, server);
        }
        if (contractType === "Merge Overlapping Intervals") {
          const res = mergeOverlappingIntervals(data);
          attempt(res, contract, server);
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
