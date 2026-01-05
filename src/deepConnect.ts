import { NS } from "@ns";
import { deepConnectFn } from "./deepConnectFn";

export async function main(ns: NS): Promise<void> {
  deepConnectFn(ns, ns.args[0] as string);
}
