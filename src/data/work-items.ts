import type { MarketCode } from "./locale";

export type WorkItemType =
  | "HEALTH CLAIM"
  | "MOTOR CLAIM"
  | "BANCA"
  | "TAKAFUL"
  | "MICRO"
  | "AGENCY"
  | "INDEXING";

export type WorkItemStatus = "Requires Review" | "In Review" | "Completed";

export type WorkItem = {
  id: string;
  itemId: string;
  type: WorkItemType;
  market: MarketCode;
  title: string;
  summary: string;
  status: WorkItemStatus;
  reviewer: string;
};

export const typeColors: Record<WorkItemType, string> = {
  "HEALTH CLAIM": "bg-info",
  "MOTOR CLAIM": "bg-warning",
  BANCA: "bg-primary",
  TAKAFUL: "bg-success",
  MICRO: "bg-destructive",
  AGENCY: "bg-muted-foreground",
  INDEXING: "bg-info",
};

export const workItems: WorkItem[] = [
  /* ---------------------------- Singapore ---------------------------- */
  {
    id: "hc-4411",
    itemId: "44110",
    type: "HEALTH CLAIM",
    market: "SG",
    title: "HC-4411 · Tan Wei Ming — Mount Elizabeth admission",
    summary: "Non-panel reimbursement · S$18,400 billed · 3 line items above schedule",
    status: "Requires Review",
    reviewer: "Keiko Tanaka",
  },
  {
    id: "bnc-2201",
    itemId: "22010",
    type: "BANCA",
    market: "SG",
    title: "BNC-2201 · Priya Nair — Term Life S$300,000",
    summary: "Branch simplified issue · STP eligible · KYC verified via core banking",
    status: "Completed",
    reviewer: "Wei Larsson",
  },
  {
    id: "hc-4418",
    itemId: "44180",
    type: "HEALTH CLAIM",
    market: "SG",
    title: "HC-4418 · Lim Jia Hui — day surgery",
    summary: "Panel direct billing · pre-authorisation matched · S$4,200",
    status: "Completed",
    reviewer: "Keiko Tanaka",
  },

  /* ----------------------------- Malaysia ---------------------------- */
  {
    id: "tkf-3302",
    itemId: "33020",
    type: "TAKAFUL",
    market: "MY",
    title: "TKF-3302 · Nurul Aisyah binti Rahman — Critical Illness",
    summary: "Perlindungan Premier · CI claim RM 300,000 · waiting period boundary case",
    status: "Requires Review",
    reviewer: "Rosa Haddad",
  },
  {
    id: "hc-4425",
    itemId: "44250",
    type: "HEALTH CLAIM",
    market: "MY",
    title: "HC-4425 · Golden Peak Manufacturing — 4 member claims",
    summary: "Group medical batch · RM 22,600 · one member outside eligibility window",
    status: "In Review",
    reviewer: "Rosa Haddad",
  },
  {
    id: "bnc-2214",
    itemId: "22140",
    type: "BANCA",
    market: "MY",
    title: "BNC-2214 · Ahmad Zulkifli — Family Takaful",
    summary: "Bank channel · Wakalah model · health declaration flagged 2 disclosures",
    status: "Requires Review",
    reviewer: "Umar Macarilay",
  },

  /* ---------------------------- Indonesia ---------------------------- */
  {
    id: "mtr-7702",
    itemId: "77020",
    type: "MOTOR CLAIM",
    market: "ID",
    title: "MTR-7702 · Budi Santoso — Toyota Avanza, Bekasi",
    summary: "Rp 42.000.000 estimate · flood zone RED · photo integrity flag raised",
    status: "Requires Review",
    reviewer: "Umar Macarilay",
  },
  {
    id: "mkr-9901",
    itemId: "99010",
    type: "MICRO",
    market: "ID",
    title: "MKR-9901 · Siti Aminah — hospital cash",
    summary: "Rp 1.400.000 · below auto-payout threshold · e-wallet disbursement",
    status: "Completed",
    reviewer: "Auto-adjudicated",
  },
  {
    id: "mtr-7715",
    itemId: "77150",
    type: "MOTOR CLAIM",
    market: "ID",
    title: "MTR-7715 · Sinar Mas fleet — Honda Vario collision",
    summary: "Motorcycle third-party BI · Rp 8.600.000 · police report attached",
    status: "In Review",
    reviewer: "Priya Becker",
  },
  {
    id: "agy-5504",
    itemId: "55040",
    type: "AGENCY",
    market: "ID",
    title: "AGY-5504 · Dewi Lestari — agent appointment",
    summary: "AAJI licence verified · AML screen clear · 3 prior appointments disclosed",
    status: "Completed",
    reviewer: "Priya Becker",
  },

  /* ----------------------------- Thailand ---------------------------- */
  {
    id: "hc-4433",
    itemId: "44330",
    type: "HEALTH CLAIM",
    market: "TH",
    title: "HC-4433 · สมชาย วงศ์ไทย — Bumrungrad admission",
    summary: "฿186,000 billed · Thai-script discharge summary · OCR confidence 0.82",
    status: "Requires Review",
    reviewer: "Wei Larsson",
  },
  {
    id: "mtr-7721",
    itemId: "77210",
    type: "MOTOR CLAIM",
    market: "TH",
    title: "MTR-7721 · Napat Chaiyaporn — Isuzu D-Max",
    summary: "฿94,000 repair estimate · network workshop assigned · drivable",
    status: "Completed",
    reviewer: "Wei Larsson",
  },

  /* ----------------------------- Vietnam ----------------------------- */
  {
    id: "mtr-7734",
    itemId: "77340",
    type: "MOTOR CLAIM",
    market: "VN",
    title: "MTR-7734 · Nguyễn Văn Hùng — Honda Wave",
    summary: "₫18.500.000 · motorcycle own damage · Zalo photo submission",
    status: "Requires Review",
    reviewer: "Wei Larsson",
  },
  {
    id: "mkr-9914",
    itemId: "99140",
    type: "MICRO",
    market: "VN",
    title: "MKR-9914 · Trần Thị Mai — personal accident",
    summary: "₫4.200.000 · above auto-payout threshold · manual assessment",
    status: "In Review",
    reviewer: "Livia Franci",
  },

  /* --------------------------- Philippines --------------------------- */
  {
    id: "bnc-2228",
    itemId: "22280",
    type: "BANCA",
    market: "PH",
    title: "BNC-2228 · Maria Clara Santos — Term Life ₱2,000,000",
    summary: "Branch sale · sum assured above STP threshold · medical evidence required",
    status: "Requires Review",
    reviewer: "Ellen Tarca",
  },
  {
    id: "agy-5518",
    itemId: "55180",
    type: "AGENCY",
    market: "PH",
    title: "AGY-5518 · Jose Rizal Cruz — agent licensing",
    summary: "IC licence pending renewal · appointment held until confirmation",
    status: "In Review",
    reviewer: "Ellen Tarca",
  },
  {
    id: "mkr-9922",
    itemId: "99220",
    type: "MICRO",
    market: "PH",
    title: "MKR-9922 · Ana Reyes — accidental death",
    summary: "₱150,000 · beneficiary verification outstanding",
    status: "Requires Review",
    reviewer: "Livia Franci",
  },
];

/** KPI tiles scale with how many items the active market actually has. */
export function kpisForMarket(items: WorkItem[]) {
  const requires = items.filter((i) => i.status === "Requires Review").length;
  const inReview = items.filter((i) => i.status === "In Review").length;
  const complete = items.filter((i) => i.status === "Completed").length;
  const total = items.length || 1;
  const agentPct = Math.round((complete / total) * 100);
  return { requires, inReview, complete, agentPct };
}
