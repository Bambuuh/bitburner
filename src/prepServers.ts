// import { NS } from "@ns";
// import { batchPrepp } from "/batch/batchPrep";

// export function prepServers(
//   ns: NS,
//   purchasedServers: string[],
//   servers: string[]
// ) {
//   const weakenScript = "weaken.js";
//   const weakenCost = ns.getScriptRam(weakenScript);
//   servers.forEach((server) => {
//     const weakenTime = ns.getWeakenTime(server);
//     const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

//     const serverSecurity = ns.getServerSecurityLevel(target);
//     const serverMinSecurity = ns.getServerMinSecurityLevel(target);
//     const missingSecurity = serverSecurity - serverMinSecurity;

//     if (missingSecurity > 0) {
//       const weakenPerThread = ns.weakenAnalyze(1);
//       const threadsNeeded = Math.ceil(missingSecurity / weakenPerThread);
//       const ramCost = weakenCost * threadsNeeded;
//       if (threadsNeeded > 0 && availableRam >= ramCost) {
//         ns.exec(weakenScript, host, threadsNeeded, target, 0, Date.now());
//         return { target, TTL: weakenTime + 50 };
//       }
//     }

//     const purchasedServers = batchPrepp(ns, server);
//   });
// }
