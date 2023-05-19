import { NS } from "@ns";

export function getUpdateFromPort(
  ns: NS,
  listToUpdate: string[],
  portNumber: number
): string[] {
  let portEmpty = false;
  let updated = [...listToUpdate];

  while (!portEmpty) {
    const res = ns.readPort(portNumber);
    if (res === "NULL PORT DATA") {
      portEmpty = true;
    } else {
      updated = updated.filter((server) => server !== res);
      ns.tprint("done prepping ", res);
    }
  }

  return updated;
}
