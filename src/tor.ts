import { NS } from "@ns";

export function tor(ns: NS) {
  if (!ns.hasTorRouter()) {
    return;
  }
}
