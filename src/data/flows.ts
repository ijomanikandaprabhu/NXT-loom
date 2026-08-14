import type { MarketCode } from "./locale";

export type Flow = {
  id: string;
  name: string;
  active: boolean;
  created: string;
  markets?: MarketCode[];
  line?: string;
};

export const flows: Flow[] = [
  { id: "health-claim-adjudication", name: "Health Claim Adjudication (Panel & Reimbursement)", active: true, created: "6/02/2026", markets: ["SG", "MY", "TH", "ID"], line: "Health" },
  { id: "motor-claim-intake", name: "Motor Claim Intake (Photo & Police Report)", active: true, created: "6/04/2026", markets: ["ID", "VN", "TH"], line: "Motor" },
  { id: "bancassurance-onboarding", name: "Bancassurance Onboarding (Branch STP)", active: true, created: "5/28/2026", markets: ["SG", "MY", "PH"], line: "Life" },
  { id: "broker-placement", name: "Broker Placement & Quote Comparison", active: true, created: "6/08/2026", markets: ["SG", "MY", "ID", "VN"], line: "Broking" },
  { id: "takaful-contribution", name: "Takaful Contribution & Surplus Allocation", active: false, created: "6/10/2026", markets: ["MY", "ID"], line: "Takaful" },
  { id: "microinsurance-payout", name: "Microinsurance Auto-Payout (E-Wallet)", active: true, created: "6/06/2026", markets: ["ID", "PH", "VN"], line: "Micro" },
  { id: "agency-onboarding", name: "Agency Recruitment & Licensing Check", active: true, created: "5/20/2026", markets: ["ID", "VN", "PH"], line: "Distribution" },
  { id: "claims-indexing", name: "Claims Indexing (Document Classification)", active: true, created: "5/1/2026", markets: ["SG", "MY", "ID", "TH", "VN", "PH"], line: "Claims" },
];
