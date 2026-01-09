import { NS } from "@ns";
import { hasDoneFaction } from "./hasDoneFaction";

function getPrettyRam(ram: number): string {
  return ram >= 1024 ? `${ram / 1024} TB` : `${ram} GB`;
}

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  const oldMoney = ns.args[0] as number | undefined;
  const target = ns.args[1] as string | undefined;
  const isSharing = ns.args[2] as boolean | undefined;
  const isExpFarming = ns.args[3] as boolean | undefined;
  const servers = ns.getPurchasedServers();
  const texts: string[] = [];
  const homeRam = ns.getServerMaxRam("home");
  texts.push(`Home: ${getPrettyRam(homeRam)}`);
  const ramCounts: Record<number, number> = {};
  servers.forEach((server) => {
    const serverRam = ns.getServerMaxRam(server);
    ramCounts[serverRam] = (ramCounts[serverRam] || 0) + 1;
  });
  texts.push(`Server count: ${servers.length}`);
  Object.keys(ramCounts)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((ram) => {
      const shortenedRam = getPrettyRam(ram);
      texts.push(`${shortenedRam}: ${ramCounts[ram]}`);
    });

  texts.push("----------------------------");

  if (isSharing) {
    texts.push("Sharing");
  } else if (isExpFarming) {
    texts.push("Exp Farming");
  } else {
    const weakenTimeInMs = target ? ns.getWeakenTime(target) : 1;
    const weakenTimeInSeconds = weakenTimeInMs / 1000;
    const money = ns.getPlayer().money;
    const moneyDiff = oldMoney !== undefined ? money - oldMoney : 0;
    const incomePerSec = moneyDiff / weakenTimeInSeconds;
    const incomePerSecShort =
      incomePerSec >= 1000000000
        ? `${(incomePerSec / 1000000000).toFixed(2)} B/s`
        : incomePerSec >= 1000000
        ? `${(incomePerSec / 1000000).toFixed(2)} M/s`
        : incomePerSec >= 1000
        ? `${(incomePerSec / 1000).toFixed(2)} K/s`
        : `${incomePerSec.toFixed(2)} /s`;
    texts.push(`Target: ${target || "none"}`);
    texts.push(`Income: ${incomePerSecShort}`);
  }

  texts.push("----------------------------");

  texts.push(`CyberSec:         ${getFactionStatus(ns, "CyberSec")}`);
  texts.push(`Tian Di Hui:      ${getFactionStatus(ns, "Tian Di Hui")}`);
  texts.push(`NiteSec:          ${getFactionStatus(ns, "NiteSec")}`);
  texts.push(`The Black Hand:   ${getFactionStatus(ns, "The Black Hand")}`);
  texts.push(`BitRunners:       ${getFactionStatus(ns, "BitRunners")}`);
  texts.push(`Daedalus:         ${getFactionStatus(ns, "Daedalus")}`);
  texts.push(`Leaving Cave:     ${getFactionStatus(ns, "Leaving Cave")}`);

  ns.write("status.json", JSON.stringify(texts), "w");
}

function getFactionStatus(ns: NS, factionName: string): string {
  if (factionName === "Leaving Cave" && hasDoneFaction(ns, "Illuminati")) {
    return "[→]";
  }
  if (hasDoneFaction(ns, factionName)) {
    return "[✓]";
  }
  if (isWorkingOnFaction(ns, factionName)) {
    const currentRep = ns.singularity.getFactionRep(factionName);
    const factionAugs = ns.singularity
      .getAugmentationsFromFaction(factionName)
      .filter(
        (aug) =>
          !aug.startsWith("NeuroFlux") &&
          aug !== "Neuroreceptor Management Implant"
      );
    const mostExpensiveAugRep = factionAugs.reduce((acc, aug) => {
      const rep = ns.singularity.getAugmentationRepReq(aug);
      return rep > acc ? rep : acc;
    }, 0);

    const augPercentageProgress = (currentRep / mostExpensiveAugRep) * 100;

    return `[→] ${augPercentageProgress.toFixed(2)}%`;
  }

  return "[ ]";
}

function isWorkingOnFaction(ns: NS, factionName: string): boolean {
  const joinedFactions = ns.getPlayer().factions;
  if (joinedFactions.length === 0) {
    return false;
  }

  return joinedFactions.includes(factionName);
}
