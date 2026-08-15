/**
 * Turns a description of a process into a proposed flow outline.
 *
 * Drawing a graph node by node is the other long manual job in the app. The
 * shape of a claims or onboarding flow is highly conventional — intake, read,
 * extract, decide, review, settle — so the useful part of the description is
 * which channel it arrives on, what gets checked, and where a human is needed.
 *
 * Produces an outline for review rather than a published graph. A generated
 * flow that silently reaches production is the failure mode this whole product
 * exists to prevent.
 */

export type FlowStepKind = "intake" | "ocr" | "extract" | "switch" | "rule" | "review" | "action";

export type ProposedStep = {
  kind: FlowStepKind;
  name: string;
  detail: string;
  /** Why this step is here — shown so the outline can be argued with. */
  because: string;
};

export type FlowProposal = {
  title: string;
  steps: ProposedStep[];
  notes: string[];
};

const channels: [RegExp, string][] = [
  [/whatsapp/i, "WhatsApp"],
  [/zalo/i, "Zalo"],
  [/\bline\b/i, "LINE"],
  [/email|outlook|inbox/i, "Email"],
  [/portal|website|self.?service/i, "Portal"],
  [/api|webhook|partner|merchant|embedded/i, "API"],
  [/branch|counter|agent/i, "Branch"],
];

export function proposeFlow(text: string, market: string, takafulMarket: boolean): FlowProposal {
  const t = text.toLowerCase();
  const steps: ProposedStep[] = [];
  const notes: string[] = [];

  const channelHits = channels.filter(([re]) => re.test(text)).map(([, name]) => name);
  const channel = channelHits.length ? channelHits.join(" · ") : "Email · WhatsApp";
  if (!channelHits.length) {
    notes.push("No channel named, so intake defaults to email and WhatsApp — the two most common in the region.");
  }

  steps.push({
    kind: "intake",
    name: "Multi-channel intake",
    detail: channel,
    because: "Work has to enter somewhere before anything can read it.",
  });

  const hasDocs = /document|photo|scan|bill|invoice|receipt|slip|form|report|statement|pdf/.test(t);
  if (hasDocs) {
    steps.push({
      kind: "ocr",
      name: "OCR",
      detail: ocrScripts(market),
      because: "Documents were mentioned, and nothing downstream can read an image.",
    });
    steps.push({
      kind: "extract",
      name: "Extract fields",
      detail: "Structured fields with per-field confidence",
      because: "A decision needs values, not text.",
    });
  } else {
    notes.push("No documents mentioned, so no OCR or extraction step was added. Add one if the process receives scans or photos.");
  }

  if (/fraud|suspicious|duplicate|abuse/.test(t)) {
    steps.push({
      kind: "rule",
      name: "Fraud signal check",
      detail: "Duplicate, velocity and network signals",
      because: "You asked for fraud screening.",
    });
  }

  if (/eligib|cover|policy|benefit|limit|exclusion|waiting/.test(t)) {
    steps.push({
      kind: "rule",
      name: "Apply benefit schedule",
      detail: "Reads the product definition",
      because: "Eligibility is decided against the product, not hard-coded here.",
    });
  }

  if (/panel|network|provider|workshop|clinic/.test(t)) {
    steps.push({
      kind: "switch",
      name: "Panel or reimbursement",
      detail: "Routes on provider network membership",
      because: "Panel and non-panel settle differently.",
    });
  }

  if (takafulMarket && /takaful|shariah|syariah|tabarru/.test(t)) {
    steps.push({
      kind: "review",
      name: "Shariah board approval",
      detail: "Required node — cannot be skipped",
      because: "A Takaful decision is not valid without it.",
    });
    notes.push("Shariah approval is mandatory for Takaful and cannot be removed from a published flow.");
  }

  // People state the same boundary from either side: "review above X" and
  // "settle under X" describe one threshold, and missing the second phrasing
  // made the assistant claim no threshold was given when one plainly was.
  const MONEY = String.raw`(?:RM|S\$|Rp|฿|₫|₱)\s?[\d.,]+`;
  const above = text.match(new RegExp(String.raw`(?:above|over|exceed(?:s|ing)?|more than)\s+(${MONEY})`, "i"))?.[1];
  const under = text.match(new RegExp(String.raw`(?:under|below|less than|up to|beneath)\s+(${MONEY})`, "i"))?.[1];
  const threshold = above ?? under;

  steps.push({
    kind: "switch",
    name: "Confidence and value gate",
    detail: threshold
      ? `Auto-settle clean items up to ${threshold}; anything higher or low-confidence goes to review`
      : "Human review on low confidence",
    because: threshold
      ? `You named ${threshold}, so it routes on amount as well as confidence.`
      : "No value threshold named — routing on extraction confidence alone.",
  });

  steps.push({
    kind: "review",
    name: "Human review",
    detail: "Parks the run until someone decides",
    because: "Everything the gate is unsure about has to reach a person.",
  });

  const settles = /settle|pay|payout|disburse|reimburse|approve/.test(t);
  steps.push({
    kind: "action",
    name: settles ? "Request settlement posting" : "Mark item complete",
    detail: settles ? "Posting request to the ledger" : "Closes the work item",
    because: settles
      ? "Money movement is requested, never written directly — the ledger stays the single writer."
      : "A run needs a terminal step.",
  });

  const title =
    text.split(/[.\n]/)[0].trim().replace(/^(a|an|the)\s+/i, "").slice(0, 60) || "New flow";

  notes.push("This is an outline for review. Nothing is published until you place it on the canvas and promote it.");

  return { title: title[0]?.toUpperCase() + title.slice(1), steps, notes };
}

/** Scripts the intake actually has to read in a given market. */
function ocrScripts(market: string) {
  switch (market) {
    case "TH": return "Thai · Latin";
    case "VN": return "Vietnamese · Latin";
    case "MY": return "Bahasa Melayu · Latin";
    case "ID": return "Bahasa Indonesia · Latin";
    case "SG": return "English · Chinese · Tamil";
    case "PH": return "Filipino · Latin";
    default: return "Latin";
  }
}

export const exampleFlows = [
  "Health claim from WhatsApp with hospital bill photos, check the benefit schedule and panel status, settle anything clean under RM 5,000",
  "Motor claim from Zalo with damage photos and police report, fraud check, human review above ₫ 50,000,000",
  "Bancassurance onboarding from the branch, verify the form, no documents",
];
