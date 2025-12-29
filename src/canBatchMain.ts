import { NS } from "@ns";
import { canBatch } from "./canBatchFn";

export async function main(ns: NS): Promise<void> {
  let target = ns.args[0] as string;

  if (target === undefined || target.length === 0) {
    target = "n00dles";
  }

  const obj = canBatch(ns, target);

  if (obj) {
    ns.write("batchTarget.json", JSON.stringify(obj), "w");
  } else {
    ns.rm("batchTarget.json");
  }
}
