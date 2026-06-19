// ─── lib/intelligence/triggerEngine.ts ────────────────────────────────────────
//
// Deterministic proactive trigger engine — zero LLM calls.
// Structurally identical to getEscalationDecision() in draftTicket.ts:
// score accumulation, threshold check, result object.
//
// Trigger rules come from src/config/triggerRules.json (no redeploy needed for
// threshold/template changes; can migrate to DB table later if admin self-serve needed).

import triggerRules from "@/config/triggerRules.json";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageContext {
  path:            string;
  pageType:        string;   // 'pricing' | 'platform' | 'documentation' | 'home' | 'contact' | 'other'
  dwellMs:         number;
  scrollDepth:     number;   // 0–100
  pathHistory:     string[]; // last 5 page types visited this session
  returningVisitor: boolean;
  previousSessionHadPricingQuestion: boolean;
}

export interface TriggerResult {
  shouldTrigger: boolean;
  templateKey:   string | null;
  message:       string | null;
  score:         number;
}

// ─── Config shape (matches triggerRules.json) ─────────────────────────────────

interface TriggerRule {
  key:          string;
  threshold:    number;
  message:      string;
  conditions:   TriggerCondition[];
}

interface TriggerCondition {
  type:   string;
  [key: string]: unknown;
}

// ─── Condition evaluators ─────────────────────────────────────────────────────

function evaluateCondition(cond: TriggerCondition, ctx: PageContext): number {
  switch (cond.type) {
    case "dwell_on_page": {
      if (ctx.pageType !== cond.pageType) return 0;
      const minMs = (cond.minSeconds as number) * 1000;
      return ctx.dwellMs >= minMs ? (cond.score as number) : 0;
    }
    case "path_sequence": {
      const seq = cond.sequence as string[];
      if (seq.length > ctx.pathHistory.length) return 0;
      const tail = ctx.pathHistory.slice(-seq.length);
      return tail.every((p, i) => p === seq[i]) ? (cond.score as number) : 0;
    }
    case "returning_visitor": {
      return ctx.returningVisitor ? (cond.score as number) : 0;
    }
    case "returning_with_pricing_interest": {
      return (ctx.returningVisitor && ctx.previousSessionHadPricingQuestion)
        ? (cond.score as number) : 0;
    }
    case "scroll_depth": {
      return ctx.scrollDepth >= (cond.minDepth as number) ? (cond.score as number) : 0;
    }
    default:
      return 0;
  }
}

// ─── evaluate ─────────────────────────────────────────────────────────────────

export function evaluate(ctx: PageContext): TriggerResult {
  const rules: TriggerRule[] = (triggerRules as any).rules;

  for (const rule of rules) {
    let score = 0;
    for (const cond of rule.conditions) {
      score += evaluateCondition(cond, ctx);
    }
    if (score >= rule.threshold) {
      return {
        shouldTrigger: true,
        templateKey:   rule.key,
        message:       rule.message,
        score,
      };
    }
  }

  return { shouldTrigger: false, templateKey: null, message: null, score: 0 };
}

// ─── pageTypeFromPath ──────────────────────────────────────────────────────────
// Derives a coarse page type from the URL path without an if-chain of
// page-specific strings. Each entry is a prefix → type mapping; first match wins.

const PAGE_TYPE_MAP: Array<[string, string]> = [
  ["/pricing",       "pricing"],
  ["/platform",      "platform"],
  ["/solutions",     "solutions"],
  ["/docs",          "documentation"],
  ["/documentation", "documentation"],
  ["/contact",       "contact"],
  ["/company",       "company"],
  ["/case-studies",  "case_studies"],
  ["/resources",     "resources"],
  ["/support",       "support"],
  ["/brochure",      "brochure"],
  ["/legal",         "legal"],
];

export function pageTypeFromPath(pathname: string): string {
  // Strip locale prefix like /en/ or /ja/
  const stripped = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/") || "/";
  for (const [prefix, type] of PAGE_TYPE_MAP) {
    if (stripped.startsWith(prefix)) return type;
  }
  if (stripped === "/" || stripped === "") return "home";
  return "other";
}
