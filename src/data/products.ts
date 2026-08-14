import type { CurrencyCode, MarketCode } from "./locale";

export type Line = "Health" | "Life" | "Motor" | "Takaful" | "Micro";

export type Benefit = {
  name: string;
  limit: string;
  deductible?: string;
  waiting?: string;
};

export type Plan = {
  name: string;
  territory: string;
  premium: string;
  benefits: Benefit[];
};

export type Product = {
  id: string;
  name: string;
  localName?: string;
  line: Line;
  status: "Published" | "Draft" | "In review";
  version: string;
  updated: string;
  owner: string;
  markets: MarketCode[];
  currency: CurrencyCode;
  description: string;
  /** Shariah structure — only present on Takaful products. */
  shariah?: {
    model: "Wakalah" | "Mudharabah" | "Hybrid";
    wakalahFee?: string;
    surplusShare?: string;
    board: string;
    approved: string;
  };
  plans: Plan[];
  rules: { name: string; expression: string }[];
};

export const products: Product[] = [
  {
    id: "medishield-group",
    name: "Group Hospital & Surgical",
    line: "Health",
    status: "Published",
    version: "v5.1",
    updated: "6/02/2026",
    owner: "Wei Larsson",
    markets: ["SG", "MY"],
    currency: "SGD",
    description:
      "Employer-sponsored hospital and surgical cover with panel and non-panel settlement. Integrates with hospital pre-authorisation and supports direct billing at panel providers.",
    plans: [
      {
        name: "Plan A — Private",
        territory: "Singapore · Malaysia",
        premium: "S$1,840 / member / yr",
        benefits: [
          { name: "Hospital & Surgical", limit: "S$500,000", deductible: "S$1,000" },
          { name: "Outpatient Specialist", limit: "S$8,000", deductible: "S$50" },
          { name: "Pre & Post Hospitalisation", limit: "90 / 180 days" },
          { name: "Maternity", limit: "S$6,000", waiting: "10 months" },
        ],
      },
      {
        name: "Plan B — Restructured",
        territory: "Singapore",
        premium: "S$920 / member / yr",
        benefits: [
          { name: "Hospital & Surgical", limit: "S$150,000", deductible: "S$1,500" },
          { name: "Outpatient Specialist", limit: "S$3,000", deductible: "S$50" },
        ],
      },
    ],
    rules: [
      { name: "Eligibility", expression: "member.age >= 16 && member.age <= 70" },
      { name: "Pre-existing", expression: "condition.onset < policy.effective_date → excluded 12mo" },
      { name: "Panel direct billing", expression: "provider.panel == true && preauth.approved" },
    ],
  },
  {
    id: "takaful-keluarga",
    name: "Family Takaful",
    localName: "Takaful Keluarga",
    line: "Takaful",
    status: "Published",
    version: "v3.0",
    updated: "5/30/2026",
    owner: "Rosa Haddad",
    markets: ["MY", "ID"],
    currency: "MYR",
    description:
      "Shariah-compliant family protection on a Wakalah model. Participant contributions are split between the Tabarru' (risk donation) fund and the Participant Investment Account, with surplus distributed annually.",
    shariah: {
      model: "Wakalah",
      wakalahFee: "32% of contribution (Year 1), 15% thereafter",
      surplusShare: "50 / 50 participant : operator",
      board: "Shariah Advisory Committee",
      approved: "04/18/2026",
    },
    plans: [
      {
        name: "Perlindungan Asas",
        territory: "Malaysia",
        premium: "RM 180 / month",
        benefits: [
          { name: "Death Benefit (Tabarru')", limit: "RM 250,000" },
          { name: "Total Permanent Disability", limit: "RM 250,000" },
          { name: "Critical Illness (36 conditions)", limit: "RM 100,000", waiting: "60 days" },
          { name: "Participant Investment Account", limit: "Accumulated value" },
        ],
      },
      {
        name: "Perlindungan Premier",
        territory: "Malaysia · Indonesia",
        premium: "RM 420 / month",
        benefits: [
          { name: "Death Benefit (Tabarru')", limit: "RM 750,000" },
          { name: "Total Permanent Disability", limit: "RM 750,000" },
          { name: "Critical Illness (45 conditions)", limit: "RM 300,000", waiting: "60 days" },
          { name: "Hibah Nomination", limit: "Included" },
        ],
      },
    ],
    rules: [
      { name: "Shariah screening", expression: "!investment.involves(riba, gharar, maysir)" },
      { name: "Tabarru' allocation", expression: "contribution × tabarru_rate(age, sum_covered)" },
      { name: "Surplus distribution", expression: "tabarru_fund.surplus × 0.5 → participants" },
      { name: "Issue ages", expression: "age >= 18 && age <= 60" },
    ],
  },
  {
    id: "asuransi-mobil",
    name: "Motor Comprehensive",
    localName: "Asuransi Kendaraan Bermotor",
    line: "Motor",
    status: "Published",
    version: "v4.3",
    updated: "6/05/2026",
    owner: "Umar Macarilay",
    markets: ["ID", "TH", "VN"],
    currency: "IDR",
    description:
      "Comprehensive motor cover for cars and motorcycles with workshop-network repair, total-loss settlement, and third-party liability. Motorcycle rating band is the highest-volume segment.",
    plans: [
      {
        name: "Komprehensif — Mobil",
        territory: "Indonesia",
        premium: "Rp 4.200.000 / yr",
        benefits: [
          { name: "Own Damage", limit: "Sum insured", deductible: "Rp 300.000" },
          { name: "Third Party Liability", limit: "Rp 50.000.000" },
          { name: "Theft", limit: "Sum insured" },
          { name: "Flood & Natural Disaster", limit: "Sum insured", deductible: "Rp 500.000" },
        ],
      },
      {
        name: "Komprehensif — Motor",
        territory: "Indonesia · Vietnam · Thailand",
        premium: "Rp 680.000 / yr",
        benefits: [
          { name: "Own Damage", limit: "Sum insured", deductible: "Rp 150.000" },
          { name: "Third Party Liability", limit: "Rp 10.000.000" },
          { name: "Personal Accident — Rider", limit: "Rp 20.000.000" },
        ],
      },
    ],
    rules: [
      { name: "Vehicle age", expression: "current_year - vehicle.year <= 10" },
      { name: "Workshop network", expression: "repair.workshop in network(region)" },
      { name: "Total loss threshold", expression: "repair_cost >= 0.75 × sum_insured" },
      { name: "Flood exclusion — zone", expression: "region.flood_zone != 'RED' || endorsement.flood" },
    ],
  },
  {
    id: "bancassurance-term",
    name: "Bancassurance Term Life",
    line: "Life",
    status: "Published",
    version: "v2.4",
    updated: "5/22/2026",
    owner: "Keiko Tanaka",
    markets: ["SG", "MY", "TH", "PH"],
    currency: "SGD",
    description:
      "Simplified-issue term life distributed through bank branch and digital channels. Straight-through issue below the medical-evidence threshold, designed for a 7-minute branch sale.",
    plans: [
      {
        name: "Branch Simplified Issue",
        territory: "SG · MY · TH · PH",
        premium: "S$32 / month",
        benefits: [
          { name: "Death Benefit", limit: "S$300,000" },
          { name: "Terminal Illness", limit: "Accelerated 100%" },
          { name: "Accidental Death Rider", limit: "S$150,000" },
        ],
      },
    ],
    rules: [
      { name: "STP threshold", expression: "sum_assured <= 300000 && age <= 50" },
      { name: "Medical evidence", expression: "sum_assured > 300000 || declaration.flags > 0" },
      { name: "Bank channel eligibility", expression: "customer.kyc_status == 'VERIFIED'" },
      { name: "Free-look", expression: "14 days from delivery" },
    ],
  },
  {
    id: "mikro-proteksi",
    name: "Microinsurance — Personal Accident",
    localName: "Asuransi Mikro",
    line: "Micro",
    status: "In review",
    version: "v1.2-rc",
    updated: "6/09/2026",
    owner: "Priya Becker",
    markets: ["ID", "PH", "VN"],
    currency: "IDR",
    description:
      "Low-premium personal accident cover distributed via e-wallet and agent networks. Requires near-total straight-through processing to be economically viable at this price point.",
    plans: [
      {
        name: "Proteksi Harian",
        territory: "Indonesia · Philippines · Vietnam",
        premium: "Rp 15.000 / month",
        benefits: [
          { name: "Accidental Death", limit: "Rp 10.000.000" },
          { name: "Hospital Cash", limit: "Rp 200.000 / day", waiting: "30 days" },
          { name: "Permanent Disability", limit: "Rp 10.000.000" },
        ],
      },
    ],
    rules: [
      { name: "STP mandatory", expression: "claim.amount <= 2000000 → auto_adjudicate" },
      { name: "Channel", expression: "distribution in ['e-wallet','agent','telco']" },
      { name: "Cooling off", expression: "none — monthly renewable" },
    ],
  },
];
