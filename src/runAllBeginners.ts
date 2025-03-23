import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const purchasedServers = ns.getPurchasedServers();
  for (const server of purchasedServers) {
    ns.exec("trimmedBeginner.js", server);
  }
}
