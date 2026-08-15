import type { Node, Edge } from "@xyflow/react";

export type NodeKind =
  | "trigger"
  | "action"
  | "ai"
  | "code"
  | "switch"
  | "insights"
  | "review"
  | "group";

export type FlowNodeData = {
  kind: NodeKind;
  title: string;
  subtitle: string;
  prompt?: string;
  schema?: string;
  model?: string;
  [key: string]: unknown;
};

export type FlowGraph = {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
};

/* ------------------------------------------------------------------ *
 * Compact builders shared by every graph below
 * ------------------------------------------------------------------ */

type NodeOpts = {
  prompt?: string;
  schema?: string;
  parentId?: string;
  width?: number;
  height?: number;
};

function n(
  id: string,
  x: number,
  y: number,
  kind: NodeKind,
  title: string,
  subtitle: string,
  opts: NodeOpts = {}
): Node<FlowNodeData> {
  return {
    id,
    type: kind === "group" ? "group" : "custom",
    position: { x, y },
    ...(opts.parentId ? { parentId: opts.parentId, extent: "parent" as const } : {}),
    ...(opts.width ? { style: { width: opts.width, height: opts.height } } : {}),
    data: {
      kind,
      title,
      subtitle,
      ...(opts.prompt
        ? { prompt: opts.prompt, schema: opts.schema, model: "NXT Extract" }
        : {}),
    },
  };
}

function e(id: string, source: string, target: string, label?: string): Edge {
  return { id, source, target, ...(label ? { label } : {}) };
}

const S = (props: string) => `{\n  "type": "object",\n  "properties": {\n${props}\n  }\n}`;

/* ------------------------------------------------------------------ *
 * Flow graphs
 * ------------------------------------------------------------------ */

/** Runs in every market — document classification is jurisdiction-agnostic. */
const claimsIndexing: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "Outlook Trigger", "claims_intake_inbox"),
    n("download", 230, 40, "action", "Download Email", "download_email"),
    n("ocr", 440, 40, "action", "OCR Attachments", "ocr_bundle"),
    n("split", 650, 40, "code", "Custom Code", "split_bundle_into_components"),

    n("loop", 20, 140, "group", "", "", { width: 1240, height: 400 }),
    n("loop-label", 8, 6, "code", "index_each_component", "for each · body", { parentId: "loop" }),

    n("classify", 40, 60, "ai", "NXT Extract: Custom", "classify_62_categories", {
      parentId: "loop",
      prompt:
        "Classify this component document into exactly one of the 62 claim-indexing categories. Return the category, the confidence, and the runner-up category when the two are within 0.15 confidence of each other.",
      schema: S('    "category": { "type": "string" },\n    "confidence": { "type": "number" },\n    "runner_up": { "type": "string" }'),
    }),
    n("universal", 40, 160, "ai", "NXT Extract: Custom", "extract_universal_fields", {
      parentId: "loop",
      prompt:
        "Extract the five universal claim-tying fields present on every component: claim number, claimant name, date of loss, policy number, and policyholder.",
      schema: S('    "claim_number": { "type": "string" },\n    "claimant": { "type": "string" },\n    "date_of_loss": { "type": "string", "format": "date" },\n    "policy_number": { "type": "string" },\n    "policyholder": { "type": "string" }'),
    }),
    n("switch", 290, 110, "switch", "Switch", "category_group", { parentId: "loop" }),

    n("legal", 520, 30, "ai", "NXT Extract: Custom", "legal_extraction", {
      parentId: "loop",
      prompt: "Extract legal-document fields: attorney of record, firm, bar number, demand amount, and response deadline.",
      schema: S('    "attorney": { "type": "string" },\n    "demand_amount": { "type": "number" }'),
    }),
    n("medical", 520, 110, "ai", "NXT Extract: Custom", "medical_extraction", {
      parentId: "loop",
      prompt: "Extract medical-record fields: provider, facility, treatment dates, diagnoses, and billed amounts.",
      schema: S('    "provider": { "type": "string" },\n    "diagnoses": { "type": "array" }'),
    }),
    n("report", 520, 190, "ai", "NXT Extract: Custom", "report_extraction", {
      parentId: "loop",
      prompt: "Extract official-report fields: report number, issuing agency, officer, and stated findings.",
      schema: S('    "report_number": { "type": "string" },\n    "agency": { "type": "string" }'),
    }),
    n("other", 520, 270, "ai", "NXT Extract: Custom", "other_extraction", {
      parentId: "loop",
      prompt: "Summarize the document and extract any claim-relevant dates or amounts.",
      schema: S('    "summary": { "type": "string" }'),
    }),

    n("confidence", 790, 110, "switch", "Switch", "confidence_threshold", { parentId: "loop" }),
    n("insights", 790, 250, "insights", "Insights", "indexing_briefing", { parentId: "loop" }),
    n("review", 1010, 250, "review", "Review", "indexer_review", { parentId: "loop" }),
    n("push", 1010, 60, "action", "Update Claim", "push_to_guidewire", { parentId: "loop" }),

    n("complete", 450, 580, "action", "Mark Item as Complete", "mark_item_as_complete"),
  ],
  edges: [
    e("i1", "trigger", "download"),
    e("i2", "download", "ocr"),
    e("i3", "ocr", "split"),
    e("i4", "split", "loop"),
    e("i5", "classify", "switch"),
    e("i6", "universal", "switch"),
    e("i7", "switch", "legal", "legal_case"),
    e("i8", "switch", "medical", "medical_case"),
    e("i9", "switch", "report", "report_case"),
    e("i10", "switch", "other", "default"),
    e("i11", "legal", "confidence"),
    e("i12", "medical", "confidence"),
    e("i13", "report", "confidence"),
    e("i14", "other", "confidence"),
    e("i15", "confidence", "push", "≥ 0.85"),
    e("i16", "confidence", "insights", "< 0.85"),
    e("i17", "insights", "review"),
    e("i18", "review", "push", "confirm"),
    e("i19", "loop", "complete"),
  ],
};

/** Highest-volume workflow in SEA. Panel = direct billing, non-panel = reimbursement. */
const healthClaimAdjudication: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "Multi-channel Intake", "whatsapp_email_portal"),
    n("ocr", 250, 40, "action", "OCR — CJK/Thai/Latin", "ocr_multilingual"),
    n("lang", 470, 40, "switch", "Switch", "detect_language"),

    n("extract", 700, 20, "ai", "NXT Extract: Custom", "extract_hospital_bill", {
      prompt:
        "Extract from the hospital bill and discharge summary: provider name and code, admission and discharge dates, ICD-10 diagnosis codes, itemised charges by category, and total billed amount. Documents may be in Bahasa, Thai, Vietnamese, or English.",
      schema: S('    "provider_code": { "type": "string" },\n    "admission_date": { "type": "string", "format": "date" },\n    "icd10": { "type": "array" },\n    "line_items": { "type": "array" },\n    "total_billed": { "type": "number" }'),
    }),
    n("member", 700, 120, "action", "HTTP", "member_eligibility_lookup"),

    n("panel", 950, 70, "switch", "Switch", "panel_or_reimbursement"),

    n("benefit", 1180, 20, "code", "Custom Code", "apply_benefit_schedule"),
    n("copay", 1180, 100, "code", "Custom Code", "compute_copay_deductible"),
    n("exclusion", 1400, 60, "ai", "NXT Extract: Custom", "check_exclusions_waiting", {
      prompt:
        "Given the diagnosis and the member's policy inception date, determine whether any exclusion or waiting period applies. Cite the policy clause for any exclusion applied.",
      schema: S('    "excluded": { "type": "boolean" },\n    "clause": { "type": "string" },\n    "waiting_period_breach": { "type": "boolean" }'),
    }),

    n("fraud", 950, 250, "ai", "NXT Extract: Custom", "fraud_signal_check", {
      prompt: "Flag duplicate billing, unbundling, upcoding, or provider-pattern anomalies against claim history.",
      schema: S('    "risk_score": { "type": "number" },\n    "signals": { "type": "array" }'),
    }),

    n("decision", 1400, 200, "switch", "Switch", "adjudication_decision"),
    n("autopay", 1640, 140, "action", "Update Claim", "auto_approve_payout"),
    n("insights", 1180, 320, "insights", "Insights", "assessor_briefing"),
    n("review", 1400, 320, "review", "Review", "medical_assessor_review"),
    n("complete", 1640, 260, "action", "Mark Item as Complete", "settle_and_notify"),
  ],
  edges: [
    e("h1", "trigger", "ocr"),
    e("h2", "ocr", "lang"),
    e("h3", "lang", "extract", "th / id / vi / en"),
    e("h4", "lang", "member"),
    e("h5", "extract", "panel"),
    e("h6", "member", "panel"),
    e("h7", "panel", "benefit", "panel — direct bill"),
    e("h8", "panel", "copay", "non-panel — reimburse"),
    e("h9", "benefit", "exclusion"),
    e("h10", "copay", "exclusion"),
    e("h11", "extract", "fraud"),
    e("h12", "exclusion", "decision"),
    e("h13", "fraud", "decision"),
    e("h14", "decision", "autopay", "clean · ≤ threshold"),
    e("h15", "decision", "insights", "exclusion or fraud signal"),
    e("h16", "insights", "review"),
    e("h17", "autopay", "complete"),
    e("h18", "review", "complete", "approve"),
  ],
};

/** Motorcycle-heavy in ID/VN — photo damage assessment is the core AI step. */
const motorClaimIntake: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "WhatsApp / Zalo Intake", "motor_claim_channel"),
    n("collect", 250, 40, "action", "Download Media", "collect_photos_documents"),
    n("ocr", 470, 40, "action", "OCR — police report", "ocr_police_report"),

    n("vehicle", 700, 20, "ai", "NXT Extract: Custom", "extract_vehicle_policy", {
      prompt: "Extract plate number, chassis/engine number, make, model, year, and the policy number from the registration and policy documents.",
      schema: S('    "plate": { "type": "string" },\n    "chassis": { "type": "string" },\n    "policy_number": { "type": "string" }'),
    }),
    n("damage", 700, 110, "ai", "NXT Extract: Custom", "assess_damage_photos", {
      prompt:
        "From the damage photographs, identify each affected panel or component, classify severity (scratch, dent, deformation, replacement required), and estimate whether the vehicle is drivable. Flag any photo that appears reused or edited.",
      schema: S('    "damaged_parts": { "type": "array" },\n    "severity": { "type": "string" },\n    "photo_integrity": { "type": "string" }'),
    }),
    n("report", 700, 200, "ai", "NXT Extract: Custom", "extract_police_report", {
      prompt: "Extract incident date/time, location, parties involved, and the stated fault determination from the police report.",
      schema: S('    "incident_date": { "type": "string" },\n    "fault": { "type": "string" }'),
    }),

    n("estimate", 970, 110, "code", "Custom Code", "workshop_rate_estimate"),
    n("totalloss", 1190, 110, "switch", "Switch", "total_loss_threshold"),

    n("workshop", 1420, 40, "action", "Update Claim", "assign_network_workshop"),
    n("settle", 1420, 120, "code", "Custom Code", "total_loss_settlement"),

    n("insights", 970, 270, "insights", "Insights", "adjuster_briefing"),
    n("review", 1190, 270, "review", "Review", "motor_adjuster_review"),
    n("complete", 1420, 210, "action", "Mark Item as Complete", "authorise_repair"),
  ],
  edges: [
    e("m1", "trigger", "collect"),
    e("m2", "collect", "ocr"),
    e("m3", "ocr", "vehicle"),
    e("m4", "collect", "damage"),
    e("m5", "ocr", "report"),
    e("m6", "vehicle", "estimate"),
    e("m7", "damage", "estimate"),
    e("m8", "report", "estimate"),
    e("m9", "estimate", "totalloss"),
    e("m10", "totalloss", "workshop", "repair ≤ 75% SI"),
    e("m11", "totalloss", "settle", "total loss"),
    e("m12", "damage", "insights", "photo integrity flag"),
    e("m13", "insights", "review"),
    e("m14", "workshop", "complete"),
    e("m15", "review", "complete", "approve"),
  ],
};

/** Branch-counter sale — the whole point is a 7-minute straight-through issue. */
const bancassuranceOnboarding: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "Branch / Digital Channel", "banca_application"),
    n("kyc", 250, 40, "action", "HTTP", "core_banking_kyc_pull"),
    n("ocr", 470, 40, "action", "OCR — ID document", "ocr_national_id"),

    n("identity", 700, 20, "ai", "NXT Extract: Custom", "extract_identity", {
      prompt:
        "Extract full name exactly as printed, national ID number, date of birth, and address. Names may be mononyms (Indonesia/Malaysia) or family-name-first (Vietnam) — do not split into first/last, return the printed form and a parsed structure separately.",
      schema: S('    "name_as_printed": { "type": "string" },\n    "name_format": { "type": "string" },\n    "national_id": { "type": "string" },\n    "dob": { "type": "string", "format": "date" }'),
    }),
    n("health", 700, 110, "ai", "NXT Extract: Custom", "extract_health_declaration", {
      prompt: "Extract each health declaration answer and flag any disclosure that triggers medical evidence under the underwriting rules.",
      schema: S('    "declarations": { "type": "array" },\n    "flags": { "type": "number" }'),
    }),

    n("amla", 970, 40, "action", "HTTP", "aml_sanctions_screening"),
    n("suitability", 970, 130, "code", "Field Validation", "suitability_assessment"),

    n("stp", 1200, 85, "switch", "Switch", "stp_eligible"),
    n("issue", 1430, 20, "action", "Update Claim", "issue_policy"),
    n("deliver", 1650, 20, "action", "Mark Item as Complete", "deliver_edoc_freelook"),

    n("insights", 970, 260, "insights", "Insights", "underwriter_briefing"),
    n("review", 1200, 260, "review", "Review", "underwriter_review"),
  ],
  edges: [
    e("b1", "trigger", "kyc"),
    e("b2", "kyc", "ocr"),
    e("b3", "ocr", "identity"),
    e("b4", "trigger", "health"),
    e("b5", "identity", "amla"),
    e("b6", "health", "suitability"),
    e("b7", "amla", "stp"),
    e("b8", "suitability", "stp"),
    e("b9", "stp", "issue", "clean · ≤ SA threshold"),
    e("b10", "issue", "deliver"),
    e("b11", "stp", "insights", "flags or above threshold"),
    e("b12", "insights", "review"),
    e("b13", "review", "issue", "approve"),
  ],
};

/** Broker workflow — market a slip, then compare what came back. */
const brokerPlacement: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "Client Instruction", "placement_request"),
    n("slip", 240, 40, "ai", "NXT Extract: Custom", "build_market_slip", {
      prompt:
        "From the client's instruction and prior policy, assemble a market slip: insured details, occupation/trade, sums insured, coverage requested, deductibles, loss history summary, and any special terms required.",
      schema: S('    "insured": { "type": "string" },\n    "sums_insured": { "type": "object" },\n    "coverages_requested": { "type": "array" }'),
    }),
    n("select", 480, 40, "code", "Custom Code", "select_target_carriers"),
    n("send", 700, 40, "action", "Send Email", "distribute_slip_to_market"),

    n("loop", 20, 150, "group", "", "", { width: 1180, height: 330 }),
    n("loop-label", 8, 6, "code", "process_each_response", "for each carrier · body", { parentId: "loop" }),

    n("wait", 40, 60, "code", "Sleep", "await_carrier_response", { parentId: "loop" }),
    n("parse", 250, 60, "ai", "NXT Extract: Custom", "parse_carrier_quote", {
      parentId: "loop",
      prompt: "Extract premium, commission, deductibles, limits, sublimits, exclusions, and any subjectivities from the carrier's quotation.",
      schema: S('    "premium": { "type": "number" },\n    "commission": { "type": "number" },\n    "exclusions": { "type": "array" }'),
    }),
    n("compare", 500, 60, "ai", "NXT Extract: Custom", "detect_deviations", {
      parentId: "loop",
      prompt:
        "Compare the carrier's quoted terms against the market slip. Identify every deviation — reduced limits, added exclusions, higher deductibles, narrowed sublimits — and rank each by materiality to the client.",
      schema: S('    "deviations": { "type": "array" },\n    "materiality": { "type": "string" },\n    "matches_slip": { "type": "boolean" }'),
    }),
    n("normalise", 760, 60, "code", "Custom Code", "normalise_for_comparison", { parentId: "loop" }),
    n("status", 500, 180, "switch", "Switch", "response_type", { parentId: "loop" }),
    n("chase", 760, 180, "action", "Send Email", "chase_no_response", { parentId: "loop" }),
    n("decline", 760, 250, "code", "Custom Code", "log_decline_reason", { parentId: "loop" }),

    n("rank", 260, 530, "code", "Custom Code", "rank_quotes"),
    n("report", 500, 530, "insights", "Insights", "client_comparison_report"),
    n("review", 730, 530, "review", "Review", "broker_review"),
    n("issue", 960, 530, "action", "Mark Item as Complete", "issue_to_client"),
  ],
  edges: [
    e("p1", "trigger", "slip"),
    e("p2", "slip", "select"),
    e("p3", "select", "send"),
    e("p4", "send", "loop"),
    e("p5", "wait", "parse"),
    e("p6", "parse", "compare"),
    e("p7", "compare", "normalise"),
    e("p8", "wait", "status"),
    e("p9", "status", "chase", "no response"),
    e("p10", "status", "decline", "declined"),
    e("p11", "loop", "rank"),
    e("p12", "rank", "report"),
    e("p13", "report", "review"),
    e("p14", "review", "issue"),
  ],
};

/** Shariah-compliant contribution split and annual surplus distribution. */
const takafulContribution: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "Contribution Received", "contribution_intake"),
    n("split", 250, 40, "code", "Custom Code", "wakalah_fee_split"),
    n("tabarru", 480, 20, "code", "Custom Code", "allocate_tabarru_fund"),
    n("pia", 480, 110, "code", "Custom Code", "allocate_participant_account"),
    n("screen", 720, 110, "ai", "NXT Extract: Custom", "shariah_investment_screen", {
      prompt: "Screen the investment allocation for riba, gharar, and maysir exposure. Flag any holding that fails Shariah screening with the reason.",
      schema: S('    "compliant": { "type": "boolean" },\n    "flagged_holdings": { "type": "array" }'),
    }),
    n("surplus", 720, 20, "code", "Custom Code", "compute_annual_surplus"),
    n("board", 970, 60, "review", "Review", "shariah_board_approval"),
    n("distribute", 1200, 60, "action", "Mark Item as Complete", "distribute_surplus"),
  ],
  edges: [
    e("t1", "trigger", "split"),
    e("t2", "split", "tabarru"),
    e("t3", "split", "pia"),
    e("t4", "tabarru", "surplus"),
    e("t5", "pia", "screen"),
    e("t6", "surplus", "board"),
    e("t7", "screen", "board"),
    e("t8", "board", "distribute"),
  ],
};

const microPayout: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "E-Wallet Claim", "micro_claim_intake"),
    n("extract", 250, 40, "ai", "NXT Extract: Custom", "extract_micro_claim", {
      prompt: "Extract claim type, incident date, and supporting evidence reference from a minimal mobile submission.",
      schema: S('    "claim_type": { "type": "string" },\n    "amount": { "type": "number" }'),
    }),
    n("rules", 480, 40, "code", "Field Validation", "auto_adjudicate_rules"),
    n("threshold", 700, 40, "switch", "Switch", "payout_threshold"),
    n("pay", 930, 10, "action", "HTTP", "ewallet_payout"),
    n("review", 930, 110, "review", "Review", "manual_assessment"),
    n("complete", 1160, 50, "action", "Mark Item as Complete", "notify_member"),
  ],
  edges: [
    e("mi1", "trigger", "extract"),
    e("mi2", "extract", "rules"),
    e("mi3", "rules", "threshold"),
    e("mi4", "threshold", "pay", "≤ Rp 2jt"),
    e("mi5", "threshold", "review", "above threshold"),
    e("mi6", "pay", "complete"),
    e("mi7", "review", "complete"),
  ],
};

const agencyOnboarding: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "Agent Application", "agency_recruitment"),
    n("ocr", 250, 40, "action", "OCR — ID & certificates", "ocr_agent_documents"),
    n("extract", 480, 40, "ai", "NXT Extract: Custom", "extract_agent_credentials", {
      prompt: "Extract identity, education, prior licensing, and examination results from the agent's application pack.",
      schema: S('    "national_id": { "type": "string" },\n    "exam_results": { "type": "array" }'),
    }),
    n("license", 720, 20, "action", "HTTP", "regulator_license_check"),
    n("aml", 720, 110, "action", "HTTP", "aml_background_screen"),
    n("decision", 960, 60, "switch", "Switch", "onboarding_decision"),
    n("appoint", 1190, 10, "action", "Update Claim", "appoint_agent"),
    n("review", 1190, 110, "review", "Review", "compliance_review"),
  ],
  edges: [
    e("ag1", "trigger", "ocr"),
    e("ag2", "ocr", "extract"),
    e("ag3", "extract", "license"),
    e("ag4", "extract", "aml"),
    e("ag5", "license", "decision"),
    e("ag6", "aml", "decision"),
    e("ag7", "decision", "appoint", "clear"),
    e("ag8", "decision", "review", "flagged"),
  ],
};

export const flowGraphs: Record<string, FlowGraph> = {
  "health-claim-adjudication": healthClaimAdjudication,
  "motor-claim-intake": motorClaimIntake,
  "bancassurance-onboarding": bancassuranceOnboarding,
  "broker-placement": brokerPlacement,
  "takaful-contribution": takafulContribution,
  "microinsurance-payout": microPayout,
  "agency-onboarding": agencyOnboarding,
  "claims-indexing": claimsIndexing,
};
