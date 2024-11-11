import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0] as string;
  const delay = (ns.args[1] as number) || 0;

  if (delay > 0) {
    await ns.sleep(delay);
  }

  await ns.weaken(target);
}
