import { NS, Server } from "../NetscriptDefinitions";

export function getMockServer(
  ns: NS,
  hostname: string,
  mocks?: {
    hackedMoneyMult?: number;
  }
): Server {
  const server = ns.getServer(hostname);
  const moneyMax = ns.getServerMaxMoney(hostname);
  let moneyAvailable = moneyMax;
  if (mocks?.hackedMoneyMult) {
    moneyAvailable = moneyMax * mocks.hackedMoneyMult;
  }
  const minsec = ns.getServerMinSecurityLevel(hostname);

  return {
    ...server,
    moneyMax,
    moneyAvailable,
    minDifficulty: minsec,
    hackDifficulty: minsec,
    ...mocks,
  };
}
