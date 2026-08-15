import type { Line, Plan, Product } from "@/data/products";
import type { ProductDraft } from "@/lib/products-store";
import type { MarketCode } from "@/data/locale";

/**
 * Turns a plain description of a product into an editable draft.
 *
 * Defining a product is the longest form in the app — plans, benefits, limits,
 * deductibles, waiting periods, rules — which is an odd thing to ask of a
 * platform whose pitch is removing manual work. Most of it is predictable from
 * the line of business; the parts that are not are exactly what someone says
 * out loud when describing the product.
 *
 * Pattern matching over a template, not a language model. It reports every
 * inference it made so a person can see what came from their words and what
 * came from the template — a generator that silently invents a limit is worse
 * than a blank form.
 */

export type Inference = {
  field: string;
  value: string;
  /** stated: read from the description. assumed: supplied by the template. */
  source: "stated" | "assumed";
};

export type AssistResult = {
  draft: ProductDraft;
  inferences: Inference[];
};

const marketWords: Record<string, MarketCode> = {
  singapore: "SG", sg: "SG",
  malaysia: "MY", malaysian: "MY", my: "MY",
  indonesia: "ID", indonesian: "ID", id: "ID",
  thailand: "TH", thai: "TH", th: "TH",
  vietnam: "VN", vietnamese: "VN", vn: "VN",
  philippines: "PH", filipino: "PH", ph: "PH",
};

const lineWords: [RegExp, Line][] = [
  [/takaful|shariah|syariah|wakalah|mudharabah|tabarru/i, "Takaful"],
  [/motor|vehicle|car|fleet|automobile/i, "Motor"],
  [/micro|microinsurance|micro-insurance/i, "Micro"],
  [/life|term life|whole life|endowment/i, "Life"],
  [/health|medical|hospital|surgical|clinic/i, "Health"],
];

/** Benefit skeletons per line — the parts nobody says because they are obvious. */
const templates: Record<Line, { plan: string; benefits: { name: string; limit: string; waiting?: string; deductible?: string }[]; rules: { name: string; expression: string }[] }> = {
  Health: {
    plan: "Plan A",
    benefits: [
      { name: "Hospital & surgical", limit: "" },
      { name: "Outpatient specialist", limit: "" },
      { name: "Maternity", limit: "", waiting: "10 months" },
      { name: "Pre-existing conditions", limit: "", waiting: "12 months" },
    ],
    rules: [
      { name: "Within annual limit", expression: "claim.amount <= plan.annualLimit" },
      { name: "Waiting period elapsed", expression: "claim.lossDate >= policy.start + benefit.waiting" },
    ],
  },
  Takaful: {
    plan: "Plan A",
    benefits: [
      { name: "Critical illness", limit: "", waiting: "60 days" },
      { name: "Hospital income", limit: "" },
      { name: "Death & TPD", limit: "" },
    ],
    rules: [
      { name: "Shariah board approved", expression: "product.shariah.approved != null" },
      { name: "Tabarru' allocation", expression: "contribution.tabarru = contribution.gross - product.wakalahFee" },
    ],
  },
  Motor: {
    plan: "Comprehensive",
    benefits: [
      { name: "Own damage", limit: "", deductible: "" },
      { name: "Third party bodily injury", limit: "" },
      { name: "Third party property", limit: "" },
      { name: "Windscreen", limit: "" },
    ],
    rules: [
      { name: "Within sum insured", expression: "claim.amount <= policy.sumInsured" },
      { name: "Valid licence at loss", expression: "driver.licenceValid == true" },
    ],
  },
  Life: {
    plan: "Standard",
    benefits: [
      { name: "Death benefit", limit: "" },
      { name: "Total & permanent disability", limit: "", waiting: "90 days" },
      { name: "Terminal illness", limit: "" },
    ],
    rules: [
      { name: "Suicide exclusion", expression: "claim.lossDate >= policy.start + 13 months" },
      { name: "Disclosure verified", expression: "underwriting.disclosuresChecked == true" },
    ],
  },
  Micro: {
    plan: "Basic",
    benefits: [
      { name: "Accidental death", limit: "" },
      { name: "Hospital cash", limit: "" },
    ],
    rules: [{ name: "Single claim per period", expression: "claims.countInPeriod <= 1" }],
  },
};

/** Currency amounts as they are actually written across the region. */
const AMOUNT = /((?:RM|S\$|Rp|฿|₫|₱|USD|SGD|MYR|IDR|THB|VND|PHP)\s?[\d.,]+(?:\s?(?:juta|jt|ribu|tỷ|triệu|k|m))?)/gi;
const WAITING = /(\d+)[\s-]?(days?|months?|weeks?|minggu|hari|bulan|เดือน|วัน|tháng|ngày)/gi;

export function draftFromDescription(
  text: string,
  fallbackMarket: MarketCode,
  currency: string,
  existingId: string
): AssistResult {
  const inferences: Inference[] = [];
  const said = (field: string, value: string) => inferences.push({ field, value, source: "stated" });
  const assumed = (field: string, value: string) => inferences.push({ field, value, source: "assumed" });

  // --- line of business ---
  let line: Line = "Health";
  const lineHit = lineWords.find(([re]) => re.test(text));
  if (lineHit) {
    line = lineHit[1];
    said("Line of business", line);
  } else {
    assumed("Line of business", line);
  }

  // --- markets ---
  const found = new Set<MarketCode>();
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  for (const w of words) if (marketWords[w]) found.add(marketWords[w]);
  const markets = found.size ? Array.from(found) : [fallbackMarket];
  if (found.size) said("Markets", markets.join(", "));
  else assumed("Markets", `${fallbackMarket} (your active market)`);

  // --- name: the phrase before the first market or line keyword, else a title ---
  const firstSentence = text.split(/[.\n]/)[0].trim();
  const name = titleCase(
    firstSentence
      .replace(/^(a|an|the)\s+/i, "")
      .replace(/\s+(for|in|covering|with)\s+.*$/i, "")
      .slice(0, 60)
      .trim()
  );
  if (name.length > 2) said("Product name", name);

  // --- amounts and waiting periods, in the order they were written ---
  const amounts = Array.from(text.matchAll(AMOUNT)).map((m) => normaliseAmount(m[1]));
  const waits = Array.from(text.matchAll(WAITING)).map((m) => `${m[1]} ${normaliseUnit(m[2], Number(m[1]))}`);

  const tpl = templates[line];
  // A stated waiting period always beats the template's, and is reported as
  // stated. Labelling the user's own words "assumed" is worse than not
  // splitting the list at all — it teaches them to distrust the labels.
  const benefits = tpl.benefits.map((b, i) => {
    const limit = amounts[i] ?? "";
    const statedWait = waits[i];
    const waiting = statedWait ?? b.waiting;

    if (limit) said(`${b.name} limit`, limit);
    else assumed(`${b.name}`, "limit left blank for you to set");

    if (statedWait) said(`${b.name} waiting period`, statedWait);
    else if (b.waiting) assumed(`${b.name} waiting period`, b.waiting);

    return { name: b.name, limit, deductible: b.deductible, waiting };
  });

  // A stated waiting period the template had no slot for still belongs somewhere.
  if (waits.length && !benefits.some((b) => b.waiting)) {
    benefits[0].waiting = waits[0];
    said("Waiting period", waits[0]);
  }

  const plan: Plan = {
    name: tpl.plan,
    territory: markets.map(marketLabel).join(" · "),
    premium: "",
    benefits,
  };
  assumed("Plan", `${tpl.plan} — rename or add more`);
  assumed("Underwriting rules", `${tpl.rules.length} standard ${line.toLowerCase()} rules`);

  const draft: ProductDraft = {
    id: existingId,
    name: name.length > 2 ? name : "",
    line,
    status: "Draft",
    owner: "",
    markets,
    currency: currency as Product["currency"],
    description: text.trim(),
    plans: [plan],
    rules: tpl.rules,
  };

  if (line === "Takaful") {
    const model = /mudharabah/i.test(text) ? "Mudharabah" : /hybrid/i.test(text) ? "Hybrid" : "Wakalah";
    draft.shariah = { model, board: "", approved: "", wakalahFee: "", surplusShare: "" };
    if (/wakalah|mudharabah|hybrid/i.test(text)) said("Shariah model", model);
    else assumed("Shariah model", model);
    assumed("Shariah board", "required before saving — you must supply it");
  }

  return { draft, inferences };
}

function titleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1));
}

function marketLabel(code: MarketCode) {
  const names: Record<string, string> = {
    SG: "Singapore", MY: "Malaysia", ID: "Indonesia",
    TH: "Thailand", VN: "Vietnam", PH: "Philippines",
  };
  return names[code] ?? code;
}

/** "rm300,000" and "RM 300000" both mean the same thing to a person. */
function normaliseAmount(raw: string) {
  const t = raw.trim().replace(/\s+/g, " ");
  const sym = t.match(/^(RM|S\$|Rp|฿|₫|₱|USD|SGD|MYR|IDR|THB|VND|PHP)/i)?.[0] ?? "";
  const rest = t.slice(sym.length).trim();
  return sym ? `${sym.toUpperCase() === "S$" ? "S$" : sym} ${rest}`.replace(/\s+/g, " ").trim() : t;
}

/** People write "60 day waiting period"; the schedule should read "60 days". */
function normaliseUnit(u: string, n: number) {
  const l = u.toLowerCase();
  const unit = /^(hari|วัน|ngày|day)/.test(l)
    ? "day"
    : /^(bulan|เดือน|tháng|month)/.test(l)
      ? "month"
      : /^(minggu|week)/.test(l)
        ? "week"
        : null;
  if (!unit) return u;
  return n === 1 ? unit : `${unit}s`;
}

export const exampleDescriptions = [
  "Family Takaful medical plan for Malaysia with RM 300,000 critical illness cover and a 60 day waiting period, Wakalah model",
  "Group hospital and surgical for Singapore and Malaysia, S$ 150,000 annual limit",
  "Motor fleet comprehensive for Indonesia, Rp 500,000,000 own damage",
  "Microinsurance accidental death for the Philippines, ₱ 100,000",
];
