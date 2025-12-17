import { NS } from "@ns";
import { getServerAvailableRam } from "/utils/getServerAvailableRam";

export async function main(ns: NS): Promise<void> {
  let isPrimed = false;
  while (!isPrimed) {
    const target = "n00dles";
    const weakenScript = "weaken.js";
    const minSecurity = ns.getServerMinSecurityLevel(target);
    const currSecurity = ns.getServerSecurityLevel(target);
    const weakenCost = ns.getScriptRam(weakenScript);
    const missingSecurity = currSecurity - minSecurity;
    const weakenPerThread = ns.weakenAnalyze(1);

    const server = "home";

    if (missingSecurity > 0) {
      let threadsRemaining = Math.ceil(missingSecurity / weakenPerThread);

      if (threadsRemaining <= 0) {
        break;
      }

      const availableRam = getServerAvailableRam(ns, server);
      const maxThreads = Math.floor(availableRam / weakenCost);

      if (maxThreads > 0) {
        const threads = Math.min(maxThreads, threadsRemaining);
        const execResult = ns.exec(weakenScript, server, threads, target);

        if (execResult === 0) {
          ns.tprint(`Failed to execute weaken script on ${server}`);
        }
        threadsRemaining -= threads;
      }
    } else {
      isPrimed = true;
      ns.exec("miniBatchHacker.js", server);
    }

    await ns.sleep(1000);
  }
}
