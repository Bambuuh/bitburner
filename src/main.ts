import { NS } from "@ns";
// import { getHackableServers } from "/utils/findServers";
import { batchHack } from "batch/batchHack";

export async function main(ns: NS): Promise<void> {
  const target = "n00dles";
  const hackPercentage = 0.1;
  const batchInterval = 200;

  // const hackableServers = getHackableServers(ns);
  // ns.tprint(hackableServers);

  while (true) {
    batchHack(ns, target, hackPercentage);
    await ns.sleep(batchInterval);
  }
}
