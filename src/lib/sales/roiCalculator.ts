// ─── lib/sales/roiCalculator.ts ───────────────────────────────────────────────
//
// Pure, deterministic ROI calculator. Zero LLM calls.
// The LLM's only role is to *phrase* the result — never to compute it.
//
// Pricing constants come from src/config/pricingConfig.json (admin-editable).

import pricingConfig from "@/config/pricingConfig.json";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ROIInput {
  stores:           number;   // total number of retail locations
  auditsPerMonth:   number;   // manual shelf audits per store per month
  hoursPerAudit:    number;   // staff-hours consumed per audit
  hourlyRate:       number;   // blended hourly labour cost (USD or local currency)
}

export interface ROIResult {
  currentAnnualCost:    number;   // stores × auditsPerMonth × 12 × hoursPerAudit × hourlyRate
  automatedAnnualCost:  number;   // driven by plan tier in pricingConfig
  annualSavings:        number;
  paybackMonths:        number;   // implementationCost / (annualSavings / 12)
  planTier:             string;   // which tier was selected
  currency:             string;   // from pricingConfig
  isComplete:           boolean;  // false if any inputs are missing
}

export interface ROIInputPartial {
  stores?:         number;
  auditsPerMonth?: number;
  hoursPerAudit?:  number;
  hourlyRate?:     number;
}

// ─── Pricing config shape ─────────────────────────────────────────────────────

interface PricingTier {
  name:               string;
  maxStores:          number;   // -1 = unlimited
  annualPlatformCost: number;
}

const tiers: PricingTier[] = (pricingConfig as any).tiers;
const implementationCost: number = (pricingConfig as any).implementationCost;
const currency: string = (pricingConfig as any).currency;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function selectTier(stores: number): PricingTier {
  const sorted = [...tiers].sort((a, b) => a.maxStores - b.maxStores);
  return sorted.find(t => t.maxStores === -1 || t.maxStores >= stores) ?? sorted[sorted.length - 1];
}

// ─── calcROI ──────────────────────────────────────────────────────────────────

export function calcROI(input: ROIInput): ROIResult {
  const currentAnnualCost =
    input.stores * input.auditsPerMonth * 12 * input.hoursPerAudit * input.hourlyRate;

  const tier = selectTier(input.stores);
  const automatedAnnualCost = tier.annualPlatformCost;
  const annualSavings = currentAnnualCost - automatedAnnualCost;
  const paybackMonths = annualSavings > 0
    ? (implementationCost / (annualSavings / 12))
    : Infinity;

  return {
    currentAnnualCost:   Math.round(currentAnnualCost),
    automatedAnnualCost: Math.round(automatedAnnualCost),
    annualSavings:       Math.round(annualSavings),
    paybackMonths:       paybackMonths === Infinity ? -1 : Math.round(paybackMonths * 10) / 10,
    planTier:            tier.name,
    currency,
    isComplete:          true,
  };
}

// ─── buildROIContextBlock ─────────────────────────────────────────────────────
// Returns a terse prompt block the system prompt can inject when ROI has been
// computed. The LLM receives numbers, not instructions to estimate them.

export function buildROIContextBlock(result: ROIResult): string {
  const fmt = (n: number) =>
    n < 0 ? "N/A" : `${result.currency}${n.toLocaleString()}`;

  return [
    "COMPUTED ROI ESTIMATE (authoritative — do not recalculate or estimate differently):",
    `  Current annual manual audit cost : ${fmt(result.currentAnnualCost)}`,
    `  ISA automated annual cost        : ${fmt(result.automatedAnnualCost)}`,
    `  Projected annual savings          : ${fmt(result.annualSavings)}`,
    `  Payback period                    : ${result.paybackMonths < 0 ? "N/A" : result.paybackMonths + " months"}`,
    `  Recommended plan tier             : ${result.planTier}`,
    "Use these exact figures when discussing ROI with the visitor. Never produce alternative estimates.",
  ].join("\n");
}

// ─── missingInputs ────────────────────────────────────────────────────────────
// Returns which inputs are still needed, so the LLM can ask for exactly one
// at a time rather than a wall of questions.

export function missingInputs(partial: ROIInputPartial): string[] {
  const missing: string[] = [];
  if (!partial.stores)         missing.push("how many retail stores/locations you operate");
  if (!partial.auditsPerMonth) missing.push("how many shelf audits you run per store per month");
  if (!partial.hoursPerAudit)  missing.push("how many staff-hours each audit takes");
  if (!partial.hourlyRate)     missing.push("the blended hourly labour cost for audit staff");
  return missing;
}
