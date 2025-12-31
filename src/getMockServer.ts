import { NS, Server } from "../NetscriptDefinitions";

export function getMockServer(
  ns: NS,
  hostname: string,
  mocks?: {
    hackedMoneyMult?: number;
  }
): Server {
  const moneyMax = ns.getServerMaxMoney(hostname);
  let moneyAvailable = moneyMax;
  if (mocks?.hackedMoneyMult) {
    moneyAvailable = moneyMax * mocks.hackedMoneyMult;
  }
  const minsec = ns.getServerMinSecurityLevel(hostname);
  return {
    hostname,
    moneyMax,
    moneyAvailable,
    minDifficulty: minsec,
    hackDifficulty: minsec,
    cpuCores: 1,
    ftpPortOpen: true,
    hasAdminRights: true,
    httpPortOpen: true,
    ip: "0.0.0.0",
    isConnectedTo: true,
    maxRam: 8,
    organizationName: "mock",
    purchasedByPlayer: false,
    ramUsed: 0,
    requiredHackingSkill: 1,
    smtpPortOpen: true,
    sshPortOpen: true,
    sqlPortOpen: true,
    ...mocks,
  };
}
