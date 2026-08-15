import { marketByCode, type MarketCode } from "./locale";

export type FieldStatus = "ok" | "verify";

export type ReviewField = {
  label: string;
  value: string;
  note?: string;
  status?: FieldStatus;
  docRefs: number[];
};

export type FieldGroup = {
  name: string;
  filled: number;
  total: number;
  warnings?: number;
  fields: ReviewField[];
};

export type SourceDoc = {
  name: string;
  kind: string;
  size: string;
  ext: "PDF" | "EML" | "ZIP" | "XLSX";
};

export type KeyInsight = {
  title: string;
  detail: string;
  tone: "success" | "primary" | "warning" | "info";
};

export type NarrativeSection = {
  eyebrow: string;
  body: string;
};

export type AuditEvent = {
  date: string;
  label: string;
  active?: boolean;
};

export type StatChip = { label: string; value: string; accent?: boolean };

export type ItemDetail = {
  breadcrumb: string;
  /** tailwind gradient classes for the hero banner — per item type */
  banner: string;
  bannerEyebrow: string;
  bannerTitle: string;
  bannerBody: string;
  confidence: number;
  recommendationTitle: string;
  recommendationBody: string;
  stats: StatChip[];
  keyInsights: KeyInsight[];
  narratives: { heading: string; sections: NarrativeSection[] }[];
  sourceDocs: SourceDoc[];
  audit: AuditEvent[];
  completion: number;
  groups: FieldGroup[];
};

const ok = (label: string, value: string, docRefs: number[] = [1]): ReviewField => ({
  label,
  value,
  docRefs,
});
const verify = (
  label: string,
  value: string,
  note: string,
  docRefs: number[] = [1]
): ReviewField => ({ label, value, note, status: "verify", docRefs });

export const itemDetails: Record<string, ItemDetail> = {};

/** Builds detail content for an item from its own market, type, and summary. */
export function genericDetail(
  id: string,
  title: string,
  summary: string,
  type: string,
  market: MarketCode = "SG"
): ItemDetail {
  const m = marketByCode(market);
  const banner: Record<string, string> = {
    "HEALTH CLAIM": "from-[oklch(0.38_0.10_231)] to-[oklch(0.29_0.08_236)]",
    "MOTOR CLAIM": "from-[oklch(0.42_0.12_45)] to-[oklch(0.32_0.10_38)]",
    BANCA: "from-primary to-[oklch(0.34_0.10_190)]",
    TAKAFUL: "from-[oklch(0.40_0.11_150)] to-[oklch(0.30_0.09_158)]",
    MICRO: "from-[oklch(0.40_0.15_18)] to-[oklch(0.31_0.12_14)]",
    AGENCY: "from-[oklch(0.38_0.10_60)] to-[oklch(0.29_0.08_52)]",
    INDEXING: "from-primary to-[oklch(0.34_0.10_190)]",
  };

  return {
    breadcrumb: `${m.name} · ${type}`,
    banner: banner[type] ?? banner.INDEXING,
    bannerEyebrow: `${type} — ${m.regulator} jurisdiction`,
    bannerTitle: title.split("·").slice(1).join("·").trim() || title,
    bannerBody: `${summary}. Processed under ${m.regulatorName} rules with personal data held ${
      m.residency === "required" ? `in-country per ${m.dataLaw}` : `in region per ${m.dataLaw}`
    }. Fields below the configured confidence threshold are flagged for your review.`,
    confidence: 91,
    recommendationTitle: "Approve and Push Downstream",
    recommendationBody: `Extraction is complete and validation rules passed for the ${m.name} rule set. Review the flagged fields below, then submit to push results to the downstream system.`,
    stats: [
      { label: "Fields", value: "24" },
      { label: "Avg Confidence", value: "91%" },
      { label: "Flags", value: "2", accent: true },
    ],
    keyInsights: [
      { title: "Extraction Complete · 24 Fields", detail: "All required fields present across source documents", tone: "success" },
      { title: `Validation · ${m.regulator} rule set passed`, detail: "No deterministic rule violations detected", tone: "primary" },
      { title: "Low Confidence · 2 Fields", detail: "Flagged below the 0.85 threshold for human review", tone: "warning" },
      { title: `Data Residency · ${m.residency === "required" ? "In-country" : "In-region"}`, detail: m.dataLaw, tone: "info" },
    ],
    narratives: [
      {
        heading: "Processing Narrative",
        sections: [
          {
            eyebrow: "Intake summary",
            body: `${summary}. Documents were received, OCR'd in ${m.languages.join(" and ")}, and classified before field extraction ran against the ${type.toLowerCase()} schema for ${m.name}.`,
          },
          {
            eyebrow: "Jurisdiction",
            body: `This item falls under ${m.regulatorName} (${m.regulator}). Personal data is stored ${
              m.residency === "required" ? "in-country as required by" : "in region under"
            } ${m.dataLaw}. Amounts are denominated in ${m.currency}.`,
          },
        ],
      },
    ],
    sourceDocs: [
      { name: `${id.toUpperCase()}_Primary.pdf`, kind: "Application", size: "1.1MB", ext: "PDF" },
      { name: `${id.toUpperCase()}_Supporting.pdf`, kind: "Supporting", size: "0.7MB", ext: "PDF" },
      { name: "Correspondence.eml", kind: "Communications", size: "0.1MB", ext: "EML" },
    ],
    audit: [
      { date: "Jun 10", label: "AI extraction complete", active: true },
      { date: "Jun 10", label: `Documents classified — ${m.languages[0]} source` },
      { date: "Jun 10", label: "Intake received" },
    ],
    completion: 85,
    groups: [
      {
        name: "Core Identifiers",
        filled: 4,
        total: 4,
        fields: [
          ok("Reference", id.toUpperCase()),
          ok("Market", `${m.flag} ${m.name}`),
          ok("Regulator", m.regulator),
          ok("Currency", m.currency),
        ],
      },
      {
        name: "Extracted Details",
        filled: 5,
        total: 6,
        warnings: 1,
        fields: [
          ok("Line of Business", type),
          ok("Effective Date", "01/07/2026"),
          ok("Expiry Date", "01/07/2027"),
          ok("Channel", "Broker portal"),
          ok("Handler", "Assigned"),
          verify(
            "Sum Insured",
            "Pending reconciliation",
            "Stated total differs from the schedule sum — confirm before pushing downstream"
          ),
        ],
      },
    ],
  };
}
