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
  trigger: "Outlook" | "Manual upload" | "HTTP" | "Schedule";
  status: RunStatus;
  started: string;
  duration: string;
  requester: string;
  line: "P&C" | "Health" | "Life";
  steps: RunStep[];
};

export const runs: Run[] = [
  {
    id: "run_8a4f2c",
    flow: "FNOL with Coverage Analysis (Claim-to-Policy)",
    flowId: "fnol-coverage-analysis",
    version: "v17",
    environment: "prod",
    trigger: "Outlook",
    status: "Awaiting review",
    started: "Today, 10:14 AM",
    duration: "38s",
    requester: "claims-intake@",
    line: "P&C",
    steps: [
      { node: "Outlook Trigger", key: "new_property_fnol", status: "succeeded", duration: "140ms", detail: "Email bdc-88421 from broker-portal" },
      { node: "Download Email", key: "download_email", status: "succeeded", duration: "320ms", detail: "3 attachments retrieved" },
      { node: "OCR Attachments", key: "ocr_attachments", status: "succeeded", duration: "1.8s", detail: "14 pages processed, no unreadable pages" },
      { node: "Extract FNOL Fields", key: "fnol_email_extract", status: "retried", attempt: 2, duration: "2.4s", detail: "Transient 503 from model gateway on attempt 1, recovered", io: 'avg_confidence: 0.61\npolicy_number: "CGL-PA-7711-04" (0.98)\ncause_of_loss: "water damage" (0.61)' },
      { node: "If · confidence", key: "node_if_conf", status: "succeeded", duration: "2ms", detail: "0.61 < 0.95 → routed to human review" },
      { node: "Human Review", key: "adjuster_review", status: "waiting", duration: "4m 12s", detail: "Work item wi_88201 assigned to J. Alvarez — run paused, resumes on decision" },
    ],
  },
  {
    id: "run_7c11e0",
    flow: "Claims Indexing (62-Category Document Classification)",
    flowId: "claims-indexing",
    version: "v9",
    environment: "prod",
    trigger: "Outlook",
    status: "Succeeded",
    started: "Today, 10:02 AM",
    duration: "12s",
    requester: "claims-intake@",
    line: "P&C",
    steps: [
      { node: "Outlook Trigger", key: "claims_intake_inbox", status: "succeeded", duration: "110ms", detail: "Email from wexlerlaw.com" },
      { node: "Split Bundle", key: "split_bundle_into_components", status: "succeeded", duration: "480ms", detail: "14 pages → 6 components" },
      { node: "Classify 62 Categories", key: "classify_62_categories", status: "succeeded", duration: "6.1s", detail: "6 components classified, 1 below threshold" },
      { node: "Update Claim", key: "push_to_guidewire", status: "succeeded", duration: "1.9s", detail: "6 documents indexed to CLM-2024-118827" },
    ],
  },
  {
    id: "run_5f902a",
    flow: "Submission Intake & Underwriting",
    flowId: "submission-intake-underwriting",
    version: "v23",
    environment: "prod",
    trigger: "Manual upload",
    status: "Failed",
    started: "Today, 09:48 AM",
    duration: "4s",
    requester: "Sarah Chen",
    line: "P&C",
    steps: [
      { node: "Manual File Upload", key: "trigger_manual_file_upload_1", status: "succeeded", duration: "90ms", detail: "1 file, 4.2MB" },
      { node: "OCR All Files", key: "ocr_all_files", status: "failed", duration: "3.4s", detail: "Password-protected PDF — OCR cannot read encrypted source", io: 'error: "PDFEncryptedError"\nfile: "Submission_KingsCounty.pdf"\nremediation: "request unprotected copy from broker"' },
      { node: "Submission Overview Extraction", key: "submission_overview_extraction", status: "skipped", duration: "—", detail: "Skipped — upstream node failed" },
    ],
  },
  {
    id: "run_44d1bb",
    flow: "WC Premium Audit (NCCI Class Code Lookup)",
    flowId: "wc-premium-audit",
    version: "v6",
    environment: "prod",
    trigger: "Manual upload",
    status: "Succeeded",
    started: "Today, 09:31 AM",
    duration: "29s",
    requester: "Ellen Tarca",
    line: "P&C",
    steps: [
      { node: "Manual File Upload", key: "audit_packet_upload", status: "succeeded", duration: "120ms", detail: "4 files, 8.2MB" },
      { node: "Extract Payroll Records", key: "extract_payroll_records", status: "succeeded", duration: "11.4s", detail: "142 payroll records extracted" },
      { node: "NCCI Class Code Lookup", key: "ncci_class_code_lookup", status: "succeeded", duration: "2.2s", detail: "4 class codes verified against NCCI" },
      { node: "Recompute Earned Premium", key: "recompute_earned_premium", status: "succeeded", duration: "310ms", detail: "Additional premium $41,900" },
    ],
  },
  {
    id: "run_31aa76",
    flow: "Health Claim Adjudication",
    flowId: "health-claim-adjudication",
    version: "v4",
    environment: "prod",
    trigger: "HTTP",
    status: "Running",
    started: "Today, 10:19 AM",
    duration: "14s",
    requester: "api:svc-claims",
    line: "Health",
    steps: [
      { node: "HTTP Trigger", key: "claims_webhook", status: "succeeded", duration: "80ms", detail: "Payload from provider portal" },
      { node: "Extract Medical Claim", key: "medical_claim_extract", status: "succeeded", duration: "5.8s", detail: "CPT and ICD-10 codes extracted" },
      { node: "Benefit Eligibility Check", key: "benefit_eligibility", status: "running", duration: "8.1s", detail: "Checking member benefit schedule" },
    ],
  },
  {
    id: "run_209fce",
    flow: "Commercial Auto Endorsement (Straight-Through Processing)",
    flowId: "commercial-auto-endorsement",
    version: "v11",
    environment: "prod",
    trigger: "Outlook",
    status: "Succeeded",
    started: "Today, 08:57 AM",
    duration: "51s",
    requester: "endorsements@",
    line: "P&C",
    steps: [
      { node: "Outlook Trigger", key: "endorsement_requests_inbox", status: "succeeded", duration: "130ms", detail: "Request from Cascade Pacific fleet manager" },
      { node: "Eligibility Rules", key: "eligibility_rules", status: "succeeded", duration: "220ms", detail: "5 of 6 units auto-bind eligible" },
      { node: "Apply Endorsement", key: "apply_endorsement", status: "succeeded", duration: "3.1s", detail: "5 units posted to policy CA-OR-748291-25" },
    ],
  },
  {
    id: "run_1a7d55",
    flow: "Life Underwriting Triage",
    flowId: "life-underwriting-triage",
    version: "v2",
    environment: "staging",
    trigger: "Schedule",
    status: "Retrying",
    started: "Today, 08:40 AM",
    duration: "1m 02s",
    requester: "scheduler",
    line: "Life",
    steps: [
      { node: "Schedule Trigger", key: "nightly_triage", status: "succeeded", duration: "60ms", detail: "Nightly batch, 34 applications" },
      { node: "Extract Application", key: "life_app_extract", status: "succeeded", duration: "22.4s", detail: "34 applications parsed" },
      { node: "Reinsurance API", key: "reinsurance_lookup", status: "retried", attempt: 3, duration: "38s", detail: "Upstream 429 rate limit — backing off, attempt 3 of 5", io: 'error: "RateLimitExceeded"\nretry_after: 30s\nnext_attempt: "08:42:14"' },
    ],
  },
  {
    id: "run_92bd41",
    flow: "Carrier Rollover (Coverage Mapping & Gap Analysis)",
    flowId: "carrier-rollover",
    version: "v5",
    environment: "prod",
    trigger: "Manual upload",
    status: "Cancelled",
    started: "Yesterday, 04:12 PM",
    duration: "38s",
    requester: "Marcus Reilly",
    line: "P&C",
    steps: [
      { node: "Manual File Upload", key: "rollover_packet_upload", status: "succeeded", duration: "140ms", detail: "2 policies, 27.5MB" },
      { node: "Extract Expiring Coverages", key: "extract_expiring_coverages", status: "succeeded", duration: "31s", detail: "44 coverage parts extracted" },
      { node: "Gap Analysis", key: "gap_analysis", status: "skipped", duration: "—", detail: "Cancelled by Marcus Reilly — wrong proposed policy uploaded" },
    ],
  },
];

export const runKpis = [
  { n: "1,842", l: "Runs, last 24h", tone: "primary" as const },
  { n: "96.1%", l: "Completion rate", tone: "success" as const },
  { n: "72", l: "Awaiting review", tone: "warning" as const },
  { n: "6", l: "Failed, last 24h", tone: "danger" as const },
  { n: "41s", l: "Median duration", tone: "info" as const },
];
