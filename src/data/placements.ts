import type { CurrencyCode, MarketCode } from "./locale";

export type QuoteStatus = "Quoted" | "Declined" | "Pending" | "Referred" | "Bound";

export type CarrierQuote = {
  carrier: string;
  status: QuoteStatus;
  premium?: number;
  commission?: number;
  /** Coverage deltas the AI found versus the requested slip. */
  deviations: string[];
  received?: string;
  note?: string;
};

export type Placement = {
  id: string;
  client: string;
  line: string;
  market: MarketCode;
  currency: CurrencyCode;
  sumInsured: number;
  inception: string;
  stage: "Marketing" | "Comparing" | "Awaiting client" | "Bound" | "Lost";
  handler: string;
  carriersApproached: number;
  daysOpen: number;
  summary: string;
  quotes: CarrierQuote[];
};

export const placements: Placement[] = [
  {
    id: "PLC-2041",
    client: "PT Sinar Mas Logistik",
    line: "Motor Fleet — 240 units",
    market: "ID",
    currency: "IDR",
    sumInsured: 48_000_000_000,
    inception: "01/07/2026",
    stage: "Comparing",
    handler: "Umar Macarilay",
    carriersApproached: 5,
    daysOpen: 6,
    summary:
      "Fleet of 168 trucks and 72 motorcycles across Java. Three carriers quoted, one declined on flood-zone aggregation, one still pending. Best price carries a flood exclusion the client has not seen.",
    quotes: [
      {
        carrier: "Asuransi Astra",
        status: "Quoted",
        premium: 612_000_000,
        commission: 15,
        deviations: ["Flood cover excluded in RED zones", "Deductible Rp 500.000 vs Rp 300.000 requested"],
        received: "2 days ago",
        note: "Cheapest, but two material deviations from the slip",
      },
      {
        carrier: "Tugu Insurance",
        status: "Quoted",
        premium: 684_000_000,
        commission: 12.5,
        deviations: ["Matches slip"],
        received: "3 days ago",
        note: "Clean terms, no deviations found",
      },
      {
        carrier: "Sompo Indonesia",
        status: "Quoted",
        premium: 731_000_000,
        commission: 17.5,
        deviations: ["Rider PA limit Rp 15jt vs Rp 20jt requested"],
        received: "1 day ago",
      },
      {
        carrier: "Allianz Utama",
        status: "Declined",
        deviations: [],
        received: "4 days ago",
        note: "Flood aggregation limit reached for Bekasi corridor",
      },
      {
        carrier: "MSIG Indonesia",
        status: "Pending",
        deviations: [],
        note: "Chased twice — underwriter on leave until 06/14",
      },
    ],
  },
  {
    id: "PLC-2038",
    client: "Golden Peak Manufacturing Sdn Bhd",
    line: "Group Medical — 340 lives",
    market: "MY",
    currency: "MYR",
    sumInsured: 2_400_000,
    inception: "01/08/2026",
    stage: "Awaiting client",
    handler: "Rosa Haddad",
    carriersApproached: 4,
    daysOpen: 11,
    summary:
      "Renewal with 18% claims-driven loading from the incumbent. Two alternative quotes secured at lower loading, one requiring a panel-provider restriction the HR director may reject.",
    quotes: [
      {
        carrier: "Great Eastern Takaful",
        status: "Quoted",
        premium: 486_000,
        commission: 10,
        deviations: ["Panel providers only for outpatient"],
        received: "5 days ago",
        note: "Takaful structure — Wakalah, surplus sharing applies",
      },
      {
        carrier: "AIA Malaysia",
        status: "Quoted",
        premium: 512_000,
        commission: 12,
        deviations: ["Matches slip"],
        received: "6 days ago",
      },
      {
        carrier: "Prudential BSN",
        status: "Referred",
        deviations: [],
        note: "Referred to head office — group size above branch authority",
      },
      {
        carrier: "Allianz Malaysia",
        status: "Quoted",
        premium: 578_000,
        commission: 12.5,
        deviations: ["Maternity waiting 12mo vs 10mo requested"],
        received: "8 days ago",
      },
    ],
  },
  {
    id: "PLC-2044",
    client: "Bao Minh Trading JSC",
    line: "Property All Risks",
    market: "VN",
    currency: "VND",
    sumInsured: 84_000_000_000,
    inception: "15/07/2026",
    stage: "Marketing",
    handler: "Wei Larsson",
    carriersApproached: 3,
    daysOpen: 2,
    summary:
      "Warehouse and cold-storage facility in Bình Dương. Slip issued to three carriers this morning; no responses yet. Cold-storage machinery breakdown is the key coverage question.",
    quotes: [
      { carrier: "Bao Viet Insurance", status: "Pending", deviations: [] },
      { carrier: "PVI Insurance", status: "Pending", deviations: [] },
      { carrier: "Liberty Vietnam", status: "Pending", deviations: [] },
    ],
  },
  {
    id: "PLC-2029",
    client: "Meridian Shipping Pte Ltd",
    line: "Marine Cargo — open cover",
    market: "SG",
    currency: "SGD",
    sumInsured: 12_000_000,
    inception: "01/06/2026",
    stage: "Bound",
    handler: "Keiko Tanaka",
    carriersApproached: 4,
    daysOpen: 0,
    summary:
      "Open cover bound with Tokio Marine at S$84,200. Terms matched the slip with no deviations; client accepted on the same day the comparison was issued.",
    quotes: [
      {
        carrier: "Tokio Marine",
        status: "Bound",
        premium: 84_200,
        commission: 15,
        deviations: ["Matches slip"],
        received: "12 days ago",
      },
      { carrier: "MSIG Singapore", status: "Quoted", premium: 91_400, commission: 15, deviations: ["War risk sublimit reduced"], received: "13 days ago" },
      { carrier: "QBE Singapore", status: "Quoted", premium: 96_800, commission: 12.5, deviations: ["Matches slip"], received: "12 days ago" },
      { carrier: "Chubb Singapore", status: "Declined", deviations: [], note: "Outside cargo appetite" },
    ],
  },
];

export const placementKpis = [
  { n: "34", l: "Open placements", tone: "primary" as const },
  { n: "S$4.2M", l: "Premium in market", tone: "info" as const },
  { n: "68%", l: "Quote-to-bind rate", tone: "success" as const },
  { n: "9", l: "Awaiting carrier", tone: "warning" as const },
  { n: "3.4d", l: "Median quote turnaround", tone: "info" as const },
];
