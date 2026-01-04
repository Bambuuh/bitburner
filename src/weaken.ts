import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  const target = ns.args[0] as string;
  await ns.weaken(target);
}
