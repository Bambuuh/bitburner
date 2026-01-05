import { NS } from "@ns";

function getPrettyRam(ram: number): string {
  return ram >= 1024 ? `${ram / 1024} TB` : `${ram} GB`;
}

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL");
  const oldMoney = ns.args[0] as number | undefined;
  const target = ns.args[1] as string | undefined;
  const servers = ns.getPurchasedServers();
  const texts: string[] = [];
  texts.push("Servers");
  texts.push("----------------------------");
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

  const homeRam = ns.getServerMaxRam("home");
  texts.push(`Home RAM: ${getPrettyRam(homeRam)}`);
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
  texts.push(`Income per second: ${incomePerSecShort}`);

  ns.write("status.json", JSON.stringify(texts), "w");
}
