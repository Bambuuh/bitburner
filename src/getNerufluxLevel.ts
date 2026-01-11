import { NS } from "../NetscriptDefinitions";

export function isAtNeurofluxMax(ns: NS) {
  const daemonLevel = ns.getServerRequiredHackingLevel("w0r1d_d43m0n");
  const minNFGLevel = Math.ceil((daemonLevel * 0.9) / 100);
  const level = getNerufluxLevel(ns);
  return level >= minNFGLevel;
}

export function getNeurofluxProgress(ns: NS) {
  const daemonLevel = ns.getServerRequiredHackingLevel("w0r1d_d43m0n");
  const minNFGLevel = Math.ceil((daemonLevel * 0.9) / 100);
  const level = getNerufluxLevel(ns);
  return `${level}/${minNFGLevel}`;
}

export function getNerufluxLevel(ns: NS) {
  const SOURCE_F_11_MOD = [1, 0.96, 0.94, 0.93];
  const AUG_QUEUE_MULT = 1.9; // CONSTANTS.MultipleAugMultiplier
  const MULT_BASE = 1.14; // CONSTANTS.NeuroFluxGovernorLevelMult
  const NFG = "NeuroFlux Governor";

  // remove effect from already purchased, but uninstalled, augmentations
  let nfgPrice = ns.singularity.getAugmentationPrice(NFG);
  const nofUninstAugs = nofUninstalledAugs(ns);
  if (nofUninstAugs > 0) {
    // source-file no. 11 changes the modifyer, we account for that here
    const priceMod = Math.pow(
      AUG_QUEUE_MULT * SOURCE_F_11_MOD[getSourceFileLevel(ns, 11)],
      nofUninstAugs
    );
    nfgPrice = nfgPrice / priceMod;
  }
  // remove base-price
  let multiplier = nfgPrice / ns.singularity.getAugmentationBasePrice(NFG);
  multiplier = multiplier / ns.getBitNodeMultipliers().AugmentationMoneyCost;
  // calculate the level from the multiplier
  const level = getBaseLog(MULT_BASE, multiplier);
  // get rid of any fraction
  return Math.round(level);
}

function getSourceFileLevel(ns: NS, n: number) {
  for (const sf of ns.singularity.getOwnedSourceFiles()) {
    if (sf["n"] == n) {
      return sf["lvl"];
    }
  }
  return 0;
}

function nofUninstalledAugs(ns: NS) {
  return (
    ns.singularity.getOwnedAugmentations(true).length -
    ns.singularity.getOwnedAugmentations(false).length
  );
}

function getBaseLog(x: number, y: number) {
  return Math.log(y) / Math.log(x);
}
