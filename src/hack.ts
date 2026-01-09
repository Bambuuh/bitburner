import { NS } from "@ns";

export const hack = "mock";

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  const target = ns.args[0] as string;
  const additionalMsec = ns.args[1] as number | undefined;

  await ns.hack(target, { additionalMsec });
}
