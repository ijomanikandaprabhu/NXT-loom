import type { MarketCode } from "./locale";

export type RunStatus =
  | "Succeeded"
  | "Failed"
  | "Running"
  | "Awaiting review"
  | "Retrying"
  | "Cancelled";

export type StepStatus = "succeeded" | "failed" | "running" | "waiting" | "retried" | "skipped";

export type RunStep = {
  node: string;
  key: string;
  status: StepStatus;
  duration: string;
  attempt?: number;
  detail: string;
  io?: string;
};

export type Run = {
  id: string;
  flow: string;
  flowId: string;
  version: string;
  environment: "prod" | "staging";
  trigger: "Outlook" | "Manual upload" | "HTTP" | "Schedule" | "WhatsApp" | "Zalo";
  status: RunStatus;
  started: string;
  duration: string;
  requester: string;
  line: "Health" | "Life" | "Motor" | "Takaful" | "Micro" | "Broking";
  market: MarketCode;
  steps: RunStep[];
};

export const runs: Run[] = [
  {
    id: "run_8a4f2c",
    flow: "Health Claim Adjudication (Panel & Reimbursement)",
    flowId: "health-claim-adjudication",
    version: "v12",
    environment: "prod",
    trigger: "Outlook",
    status: "Awaiting review",
    started: "Today, 10:14 AM",
    duration: "38s",
    requester: "claims-intake@",
    line: "Health",
    market: "SG",
    steps: [
      { node: "Multi-channel Intake", key: "whatsapp_email_portal", status: "succeeded", duration: "140ms", detail: "Email from member portal, 4 attachments" },
      { node: "OCR — CJK/Thai/Latin", key: "ocr_multilingual", status: "succeeded", duration: "1.8s", detail: "11 pages processed, English source" },
      { node: "Extract Hospital Bill", key: "extract_hospital_bill", status: "succeeded", duration: "3.2s", detail: "Mount Elizabeth — 26 line items extracted", io: 'provider_code: "MEH-SG-014"\ntotal_billed: 18400.00\nicd10: ["K80.20"]\navg_confidence: 0.71' },
      { node: "Switch · panel or reimbursement", key: "panel_or_reimbursement", status: "succeeded", duration: "2ms", detail: "Non-panel provider → reimbursement path" },
      { node: "Check Exclusions & Waiting", key: "check_exclusions_waiting", status: "succeeded", duration: "1.9s", detail: "No exclusion applies; 3 line items exceed schedule limits" },
      { node: "Medical Assessor Review", key: "medical_assessor_review", status: "waiting", duration: "4m 12s", detail: "Work item hc-4411 assigned to Keiko Tanaka — run paused, resumes on decision" },
    ],
  },
  {
    id: "run_7c11e0",
    flow: "Health Claim Adjudication (Panel & Reimbursement)",
    flowId: "health-claim-adjudication",
    version: "v12",
    environment: "prod",
    trigger: "HTTP",
    status: "Succeeded",
    started: "Today, 10:02 AM",
    duration: "12s",
    requester: "api:panel-gateway",
    line: "Health",
    market: "MY",
    steps: [
      { node: "Multi-channel Intake", key: "whatsapp_email_portal", status: "succeeded", duration: "110ms", detail: "Panel provider gateway payload" },
      { node: "Apply Benefit Schedule", key: "apply_benefit_schedule", status: "succeeded", duration: "480ms", detail: "Group medical, Golden Peak scheme" },
      { node: "Auto-approve Payout", key: "auto_approve_payout", status: "succeeded", duration: "1.9s", detail: "RM 3,180 settled direct to provider" },
    ],
  },
  {
    id: "run_5f902a",
    flow: "Motor Claim Intake (Photo & Police Report)",
    flowId: "motor-claim-intake",
    version: "v8",
    environment: "prod",
    trigger: "WhatsApp",
    status: "Failed",
    started: "Today, 09:48 AM",
    duration: "4s",
    requester: "+62 811-555-0142",
    line: "Motor",
    market: "ID",
    steps: [
      { node: "WhatsApp Intake", key: "motor_claim_channel", status: "succeeded", duration: "90ms", detail: "6 images, 1 document received" },
      { node: "OCR — police report", key: "ocr_police_report", status: "failed", duration: "3.4s", detail: "Laporan Polisi photographed at extreme angle — OCR confidence 0.31, below floor", io: 'error: "OCRConfidenceBelowFloor"\nconfidence: 0.31\nfloor: 0.55\nremediation: "request flat re-scan from claimant via WhatsApp"' },
      { node: "Extract Police Report", key: "extract_police_report", status: "skipped", duration: "—", detail: "Skipped — upstream node failed" },
    ],
  },
  {
    id: "run_44d1bb",
    flow: "Takaful Contribution & Surplus Allocation",
    flowId: "takaful-contribution",
    version: "v3",
    environment: "prod",
    trigger: "Schedule",
    status: "Succeeded",
    started: "Today, 09:31 AM",
    duration: "29s",
    requester: "scheduler",
    line: "Takaful",
    market: "MY",
    steps: [
      { node: "Contribution Received", key: "contribution_intake", status: "succeeded", duration: "120ms", detail: "Monthly batch — 1,840 participants" },
      { node: "Wakalah Fee Split", key: "wakalah_fee_split", status: "succeeded", duration: "11.4s", detail: "15% wakalah fee applied (renewal years)" },
      { node: "Allocate Tabarru' Fund", key: "allocate_tabarru_fund", status: "succeeded", duration: "2.2s", detail: "RM 284,600 to risk fund" },
      { node: "Shariah Investment Screen", key: "shariah_investment_screen", status: "succeeded", duration: "310ms", detail: "All holdings compliant — no riba/gharar/maysir exposure" },
    ],
  },
  {
    id: "run_31aa76",
    flow: "Health Claim Adjudication (Panel & Reimbursement)",
    flowId: "health-claim-adjudication",
    version: "v12",
    environment: "prod",
    trigger: "HTTP",
    status: "Running",
    started: "Today, 10:19 AM",
    duration: "14s",
    requester: "api:svc-claims",
    line: "Health",
    market: "TH",
    steps: [
      { node: "Multi-channel Intake", key: "whatsapp_email_portal", status: "succeeded", duration: "80ms", detail: "Bumrungrad provider portal" },
      { node: "OCR — CJK/Thai/Latin", key: "ocr_multilingual", status: "succeeded", duration: "5.8s", detail: "Thai-script discharge summary, 14 pages" },
      { node: "Extract Hospital Bill", key: "extract_hospital_bill", status: "running", duration: "8.1s", detail: "Extracting itemised charges — confidence tracking 0.82" },
    ],
  },
  {
    id: "run_209fce",
    flow: "Motor Claim Intake (Photo & Police Report)",
    flowId: "motor-claim-intake",
    version: "v8",
    environment: "prod",
    trigger: "Zalo",
    status: "Succeeded",
    started: "Today, 08:57 AM",
    duration: "51s",
    requester: "+84 90-555-0198",
    line: "Motor",
    market: "VN",
    steps: [
      { node: "Zalo Intake", key: "motor_claim_channel", status: "succeeded", duration: "130ms", detail: "Honda Wave — 8 damage photos" },
      { node: "Assess Damage Photos", key: "assess_damage_photos", status: "succeeded", duration: "22.4s", detail: "4 panels affected, severity moderate, photo integrity clean" },
      { node: "Workshop Rate Estimate", key: "workshop_rate_estimate", status: "succeeded", duration: "3.1s", detail: "₫18.500.000 — below total-loss threshold" },
      { node: "Assign Network Workshop", key: "assign_network_workshop", status: "succeeded", duration: "1.2s", detail: "Hanoi District 3 network workshop assigned" },
    ],
  },
  {
    id: "run_1a7d55",
    flow: "Bancassurance Onboarding (Branch STP)",
    flowId: "bancassurance-onboarding",
    version: "v6",
    environment: "staging",
    trigger: "Schedule",
    status: "Retrying",
    started: "Today, 08:40 AM",
    duration: "1m 02s",
    requester: "scheduler",
    line: "Life",
    market: "PH",
    steps: [
      { node: "Branch / Digital Channel", key: "banca_application", status: "succeeded", duration: "60ms", detail: "Nightly batch, 34 applications" },
      { node: "Extract Identity", key: "extract_identity", status: "succeeded", duration: "22.4s", detail: "34 applications parsed — 2 mononym records handled" },
      { node: "AML Sanctions Screening", key: "aml_sanctions_screening", status: "retried", attempt: 3, duration: "38s", detail: "Upstream 429 rate limit — backing off, attempt 3 of 5", io: 'error: "RateLimitExceeded"\nretry_after: 30s\nnext_attempt: "08:42:14"' },
    ],
  },
  {
    id: "run_92bd41",
    flow: "Microinsurance Auto-Payout (E-Wallet)",
    flowId: "microinsurance-payout",
    version: "v2",
    environment: "prod",
    trigger: "HTTP",
    status: "Cancelled",
    started: "Yesterday, 04:12 PM",
    duration: "38s",
    requester: "api:ewallet-partner",
    line: "Micro",
    market: "ID",
    steps: [
      { node: "E-Wallet Claim", key: "micro_claim_intake", status: "succeeded", duration: "140ms", detail: "Hospital cash claim submitted via partner app" },
      { node: "Auto-adjudicate Rules", key: "auto_adjudicate_rules", status: "succeeded", duration: "31s", detail: "Rp 1.400.000 — within auto-payout band" },
      { node: "E-Wallet Payout", key: "ewallet_payout", status: "skipped", duration: "—", detail: "Cancelled by Priya Becker — duplicate of MKR-9899" },
    ],
  },
  {
    id: "run_63ce07",
    flow: "Broker Placement & Quote Comparison",
    flowId: "broker-placement",
    version: "v4",
    environment: "prod",
    trigger: "Manual upload",
    status: "Awaiting review",
    started: "Today, 07:55 AM",
    duration: "6m 41s",
    requester: "Umar Macarilay",
    line: "Broking",
    market: "ID",
    steps: [
      { node: "Client Instruction", key: "placement_request", status: "succeeded", duration: "110ms", detail: "PT Sinar Mas Logistik — motor fleet, 240 units" },
      { node: "Build Market Slip", key: "build_market_slip", status: "succeeded", duration: "8.4s", detail: "Slip assembled from instruction and expiring policy" },
      { node: "Distribute Slip to Market", key: "distribute_slip_to_market", status: "succeeded", duration: "2.1s", detail: "Issued to 5 carriers" },
      { node: "Detect Deviations", key: "detect_deviations", status: "succeeded", duration: "12.8s", detail: "3 quotes parsed — 2 carry material deviations from slip" },
      { node: "Broker Review", key: "broker_review", status: "waiting", duration: "5m 20s", detail: "Awaiting handler sign-off before comparison is issued to client" },
    ],
  },
];
