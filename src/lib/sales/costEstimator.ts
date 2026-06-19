// ─── lib/sales/costEstimator.ts ───────────────────────────────────────────────
//
// Pure, deterministic cost/deployment estimator. Zero LLM calls.
// Looks up breakpoints from pricingConfig.json (admin-editable).

import pricingConfig from "@/config/pricingConfig.json";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CostInput {
  stores:          number;
  deploymentType:  "cloud" | "on_premise" | "hybrid";
}

export interface CostEstimate {
  tierName:             string;
  annualPlatformCost:   number;
  monthlyPlatformCost:  number;
  storageGBPerYear:     number;
  estimatedSetupCost:   number;
  deploymentType:       string;
  currency:             string;
  notes:                string[];
}

// ─── Config shapes ────────────────────────────────────────────────────────────

interface PricingTier {
  name:               string;
  maxStores:          number;
  annualPlatformCost: number;
}

const tiers: PricingTier[]       = (pricingConfig as any).tiers;
const storageGBPerStore: number  = (pricingConfig as any).storageGBPerStore ?? 5;
const setupCostBase: number      = (pricingConfig as any).implementationCost ?? 15000;
const currency: string           = (pricingConfig as any).currency ?? "$";

const DEPLOYMENT_MULTIPLIERS: Record<string, number> = {
  cloud:      1.0,
  hybrid:     1.25,
  on_premise: 1.5,
};

const DEPLOYMENT_NOTES: Record<string, string[]> = {
  cloud:      ["Hosted and managed by ISA. Fastest time-to-value."],
  hybrid:     ["On-premise data capture with cloud analytics. Requires VPN or API egress."],
  on_premise: ["Full on-site deployment. Requires dedicated hardware and IT resources."],
};

// ─── Tier selection ───────────────────────────────────────────────────────────

function selectTier(stores: number): PricingTier {
  const sorted = [...tiers].sort((a, b) => a.maxStores - b.maxStores);
  return sorted.find(t => t.maxStores === -1 || t.maxStores >= stores) ?? sorted[sorted.length - 1];
}

// ─── estimateCost ─────────────────────────────────────────────────────────────

export function estimateCost(input: CostInput): CostEstimate {
  const tier       = selectTier(input.stores);
  const multiplier = DEPLOYMENT_MULTIPLIERS[input.deploymentType] ?? 1;

  const annualPlatformCost  = Math.round(tier.annualPlatformCost * multiplier);
  const monthlyPlatformCost = Math.round(annualPlatformCost / 12);
  const storageGBPerYear    = Math.round(input.stores * storageGBPerStore);
  const estimatedSetupCost  = Math.round(setupCostBase * multiplier);

  return {
    tierName:             tier.name,
    annualPlatformCost,
    monthlyPlatformCost,
    storageGBPerYear,
    estimatedSetupCost,
    deploymentType:       input.deploymentType,
    currency,
    notes:                DEPLOYMENT_NOTES[input.deploymentType] ?? [],
  };
}

// ─── buildCostContextBlock ────────────────────────────────────────────────────

export function buildCostContextBlock(est: CostEstimate): string {
  const fmt = (n: number) => `${est.currency}${n.toLocaleString()}`;
  return [
    "COMPUTED COST ESTIMATE (authoritative — do not recalculate or estimate differently):",
    `  Plan tier           : ${est.tierName}`,
    `  Deployment type     : ${est.deploymentType}`,
    `  Annual platform cost: ${fmt(est.annualPlatformCost)}  (${fmt(est.monthlyPlatformCost)}/month)`,
    `  Estimated setup cost: ${fmt(est.estimatedSetupCost)}`,
    `  Estimated storage   : ~${est.storageGBPerYear} GB/year`,
    ...(est.notes.map(n => `  Note: ${n}`)),
    "Use these exact figures when discussing cost. Never produce alternative estimates.",
  ].join("\n");
}
