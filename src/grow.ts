import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const [hostName] = ns.args;
  await ns.grow(hostName as string);
  ns.writePort(1, hostName as string);
}
