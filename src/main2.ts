import { NS } from "@ns";

import { getHackingValue } from "/utils/getHackingValue";
import { getHackableServers } from "/utils/getHackableServers";
import { getServersToPrep } from "/utils/getServersToPrep";
import { batchHack } from "/batch/batchHack";
import { batchPrepp } from "./batch/batchPrep";

type ValueServer = {
  name: string;
  value: number;
};

export async function main(ns: NS): Promise<void> {
  let target: string | undefined = undefined;
  const serversBeingPrepped: { target: string; TTL: number }[] = [];
  const hackPercentage = 0.1;
  const batchInterval = 200;

  while (true) {
    const hackableServers = getHackableServers(ns);

    ns.tprint(serversBeingPrepped, " ", Date.now());

    const serversToCheck = hackableServers.filter(
      (server) =>
        server !== "home" &&
        server !== target &&
        serversBeingPrepped.every((prep) => prep.target !== server)
    );

    const serversToPrep = getServersToPrep(ns, serversToCheck);

    serversToPrep.forEach((server) => {
      const newPreppServer = batchPrepp(ns, server);
      if (newPreppServer) {
        ns.tprint(`Prepping ${server}`);
        const index = serversBeingPrepped.push(newPreppServer);
        setTimeout(() => {
          serversBeingPrepped.splice(index - 1, 1);
        }, newPreppServer.TTL);
      }
    });

    ns.tprint("prepping", " ", serversBeingPrepped);

    if (serversBeingPrepped.length === 0) {
      serversToCheck.map((server) => ({
        name: server,
        value: getHackingValue(ns, server),
      }));

      const mostValuedServer = serversToCheck.reduce<ValueServer | undefined>(
        (best, server) => {
          const value = getHackingValue(ns, server);
          if (!best?.value || best.value < value) {
            return { name: server, value };
          }
          return best;
        },
        undefined
      );

      if (mostValuedServer?.name !== target) {
        ns.tprint(`Targeting ${mostValuedServer?.name}`);
      }

      target = mostValuedServer?.name;

      if (target) {
        ns.tprint(`Hacking ${mostValuedServer?.name}`);
        batchHack(ns, target, hackPercentage);
      }
    }
    await ns.sleep(batchInterval);
  }
}
