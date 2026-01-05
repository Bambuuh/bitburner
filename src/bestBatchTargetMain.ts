import { NS } from "../NetscriptDefinitions";
import { batchTargetValue } from "./bestBatchTarget";

export async function main(ns: NS) {
  const target = ns.args[0];
  if (!target) {
    ns.tprint("Usage: run bestBatchTargetMain.js <target>");
    return;
  }

  const { score, server } = batchTargetValue(ns, target as string);
  ns.tprint(`Value for ${server}: ${score} / second`);
}
