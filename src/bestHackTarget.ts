import { NS, Person } from "@ns";

export function getBestTarget(ns: NS, servers: string[], player: Person) {
  // Filter for hackable servers
  const hackableServers = servers.filter((server) => {
    // Check if we have admin rights
    if (!ns.hasRootAccess(server)) return false;

    // Check if we meet the hacking requirement
    const requiredLevel = ns.getServerRequiredHackingLevel(server);
    const playerLevel = player.skills.hacking;
    if (playerLevel < requiredLevel) return false;

    // Check if server has money
    const maxMoney = ns.getServerMaxMoney(server);
    if (maxMoney <= 0) return false;

    return true;
  });

  // Calculate score for each server
  const serverScores = hackableServers.map((server) => {
    const maxMoney = ns.getServerMaxMoney(server);
    const minSecurity = ns.getServerMinSecurityLevel(server);
    const growthRate = ns.getServerGrowth(server);

    // Create mock server at minimum security
    const mockServer = ns.formulas.mockServer();
    mockServer.hostname = server;
    mockServer.hackDifficulty = minSecurity;
    mockServer.minDifficulty = minSecurity;
    mockServer.moneyAvailable = maxMoney;
    mockServer.moneyMax = maxMoney;
    mockServer.serverGrowth = growthRate;

    const hackTime = ns.formulas.hacking.hackTime(mockServer, player);
    const hackChance = ns.formulas.hacking.hackChance(mockServer, player);
    const growTime = ns.formulas.hacking.growTime(mockServer, player);
    const weakenTime = ns.formulas.hacking.weakenTime(mockServer, player);

    // Calculate money per second (theoretical maximum)
    const moneyPerSecond = (maxMoney * hackChance) / (hackTime / 1000);

    // Adjust score based on security level and growth rate
    const securityFactor = 1 / (minSecurity + 1);
    const growthFactor = growthRate / 100;

    // Consider the full HWGW cycle time
    const cycleTime = Math.max(hackTime, weakenTime, growTime);
    const timeEfficiency = 1 / (cycleTime / 1000);

    // Calculate final score with weighted factors
    const score =
      moneyPerSecond * securityFactor * growthFactor * timeEfficiency;

    return {
      server,
      score,
      maxMoney,
      minSecurity,
      growthRate,
      hackTime: hackTime / 1000, // Convert to seconds
      hackChance,
      cycleTime: cycleTime / 1000,
    };
  });

  // Sort by score (highest first)
  serverScores.sort((a, b) => b.score - a.score);

  // Return the best server name
  return serverScores.length > 0 ? serverScores[0].server : "";
}

// // Helper function to get all servers in the network
// function getAllServers(ns: NS): string[] {
//   const servers: string[] = [];
//   const visited = new Set<string>();

//   function scanServer(host: string) {
//     if (visited.has(host)) return;

//     visited.add(host);
//     servers.push(host);

//     const connectedServers = ns.scan(host);
//     for (const server of connectedServers) {
//       scanServer(server);
//     }
//   }

//   scanServer("home");
//   return servers.filter((s) => s !== "home"); // Exclude home server
// }
