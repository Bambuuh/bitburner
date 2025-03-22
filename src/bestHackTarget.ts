import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  // Get all servers in the network
  const servers = getAllServers(ns);

  // Filter for hackable servers
  const hackableServers = servers.filter((server) => {
    // Check if we have admin rights
    if (!ns.hasRootAccess(server)) return false;

    // Check if we meet the hacking requirement
    const requiredLevel = ns.getServerRequiredHackingLevel(server);
    const playerLevel = ns.getHackingLevel();
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
    const hackTime = ns.getHackTime(server);
    const hackChance = ns.hackAnalyzeChance(server);

    // Calculate money per second (theoretical maximum)
    const moneyPerSecond = (maxMoney * hackChance) / (hackTime / 1000);

    // Adjust score based on security level (lower is better)
    const securityFactor = 1 / (minSecurity + 1);

    // Calculate final score
    const score = moneyPerSecond * securityFactor;

    return {
      server,
      score,
      maxMoney,
      minSecurity,
      hackTime: hackTime / 1000, // Convert to seconds
      hackChance,
    };
  });

  // Sort by score (highest first)
  serverScores.sort((a, b) => b.score - a.score);

  // Display top 5 servers
  ns.tprint("Top 5 servers for batch hacking:");
  ns.tprint("-------------------------------");

  for (let i = 0; i < Math.min(5, serverScores.length); i++) {
    const { server, score, maxMoney, minSecurity, hackTime, hackChance } =
      serverScores[i];
    ns.tprint(`${i + 1}. ${server}`);
    ns.tprint(`   Score: ${ns.formatNumber(score, 2)}`);
    ns.tprint(`   Max Money: $${ns.formatNumber(maxMoney, 2)}`);
    ns.tprint(`   Min Security: ${minSecurity.toFixed(2)}`);
    ns.tprint(`   Hack Time: ${hackTime.toFixed(2)}s`);
    ns.tprint(`   Hack Chance: ${(hackChance * 100).toFixed(2)}%`);
    ns.tprint("-------------------------------");
  }

  // Return just the best server name if any arguments are provided
  // This allows the script to be used programmatically
  if (ns.args.length > 0 && serverScores.length > 0) {
    ns.tprint(serverScores[0].server);
  }
}

// Helper function to get all servers in the network
function getAllServers(ns: NS): string[] {
  const servers: string[] = [];
  const visited = new Set<string>();

  function scanServer(host: string) {
    if (visited.has(host)) return;

    visited.add(host);
    servers.push(host);

    const connectedServers = ns.scan(host);
    for (const server of connectedServers) {
      scanServer(server);
    }
  }

  scanServer("home");
  return servers.filter((s) => s !== "home"); // Exclude home server
}
