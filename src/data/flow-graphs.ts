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

const coverageSchema = `{
  "type": "object",
  "properties": {
    "insured_name": { "type": "string" },
    "effective_date": { "type": "string", "format": "date" },
    "expiration_date": { "type": "string", "format": "date" },
    "policy_number": { "type": "string" },
    "coverage_limits": { "type": "object" }
  }
}`;

export const fnolCoverageAnalysis: FlowGraph = {
  nodes: [
    { id: "trigger", type: "custom", position: { x: 20, y: 20 }, data: { kind: "trigger", title: "Outlook Trigger", subtitle: "new_property_fnol" } },
    { id: "download", type: "custom", position: { x: 20, y: 120 }, data: { kind: "action", title: "Download Email", subtitle: "download_email" } },
    { id: "ocr", type: "custom", position: { x: 20, y: 220 }, data: { kind: "action", title: "OCR Attachments", subtitle: "ocr_attachments" } },

    { id: "loop", type: "group", position: { x: 20, y: 320 }, data: { kind: "group", title: "", subtitle: "" }, style: { width: 1180, height: 320 } },
    { id: "loop-label", type: "custom", position: { x: 8, y: 6 }, parentId: "loop", extent: "parent", draggable: false, data: { kind: "code", title: "process_each_attachment", subtitle: "for each · body" } },

    { id: "http", type: "custom", position: { x: 8, y: 60 }, parentId: "loop", extent: "parent", data: { kind: "action", title: "HTTP", subtitle: "policy_api_lookup" } },
    { id: "classify", type: "custom", position: { x: 8, y: 160 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "classify_property_doc", prompt: "Classify this attachment into one of: photos, hoa_quote, mitigation_invoice, correspondence, other.", schema: `{ "type": "object", "properties": { "doc_type": { "type": "string" } } }`, model: "NXT Extract" } },

    { id: "coverage", type: "custom", position: { x: 190, y: 60 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "coverage_analysis", prompt: "Extract all fields defined in the output schema from the attached documents. For each field, return the raw value, source document filename, page number, and a confidence score between 0 and 1.", schema: coverageSchema, model: "NXT Extract" } },
    { id: "switch", type: "custom", position: { x: 190, y: 160 }, parentId: "loop", extent: "parent", data: { kind: "switch", title: "Switch", subtitle: "doc_type" } },

    { id: "code", type: "custom", position: { x: 370, y: 60 }, parentId: "loop", extent: "parent", data: { kind: "code", title: "Custom Code", subtitle: "init_reserve_calc" } },

    { id: "fnol-extract", type: "custom", position: { x: 550, y: 60 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "fnol_email_extract", prompt: "Extract claimant, dates, cause of loss, line of business, policy, parties and coverages from the FNOL email body.", schema: `{ "type": "object", "properties": { "claimant": { "type": "string" }, "cause_of_loss": { "type": "string" } } }`, model: "NXT Extract" } },
    { id: "photos", type: "custom", position: { x: 550, y: 130 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "photos_extract", prompt: "Describe visible damage in each photo and estimate severity.", schema: `{ "type": "object", "properties": { "damage_description": { "type": "string" } } }`, model: "NXT Extract" } },
    { id: "hoa", type: "custom", position: { x: 550, y: 200 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "hoa_quote_extract", prompt: "Extract line items and total from the repair quote.", schema: `{ "type": "object", "properties": { "total": { "type": "number" } } }`, model: "NXT Extract" } },
    { id: "mitigation", type: "custom", position: { x: 550, y: 270 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "mitigation_invoice_extract", prompt: "Extract vendor, service dates and invoice total.", schema: `{ "type": "object", "properties": { "vendor": { "type": "string" } } }`, model: "NXT Extract" } },
    { id: "correspondence", type: "custom", position: { x: 550, y: 340 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "correspondence_extract", prompt: "Summarize the correspondence and flag any coverage disputes.", schema: `{ "type": "object", "properties": { "summary": { "type": "string" } } }`, model: "NXT Extract" } },
    { id: "other", type: "custom", position: { x: 550, y: 410 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "other_doc_extract", prompt: "Summarize the document contents.", schema: `{ "type": "object", "properties": { "summary": { "type": "string" } } }`, model: "NXT Extract" } },

    { id: "insights", type: "custom", position: { x: 830, y: 60 }, parentId: "loop", extent: "parent", data: { kind: "insights", title: "Insights", subtitle: "coverage_briefing" } },
    { id: "review", type: "custom", position: { x: 1000, y: 60 }, parentId: "loop", extent: "parent", data: { kind: "review", title: "Review", subtitle: "adjuster_review" } },
    { id: "continue", type: "custom", position: { x: 830, y: 410 }, parentId: "loop", extent: "parent", data: { kind: "code", title: "continue_to_next_attachment", subtitle: "Custom" } },
  ],
  edges: [
    { id: "e1", source: "trigger", target: "download" },
    { id: "e2", source: "download", target: "ocr" },
    { id: "e3", source: "ocr", target: "loop" },
    { id: "e4", source: "http", target: "coverage" },
    { id: "e5", source: "classify", target: "switch" },
    { id: "e6", source: "coverage", target: "code" },
    { id: "e7", source: "code", target: "fnol-extract" },
    { id: "e8", source: "switch", target: "photos", label: "photos" },
    { id: "e9", source: "switch", target: "hoa", label: "hoa_quote" },
    { id: "e10", source: "switch", target: "mitigation", label: "mitigation" },
    { id: "e11", source: "switch", target: "correspondence", label: "correspondence" },
    { id: "e12", source: "switch", target: "other", label: "default" },
    { id: "e13", source: "fnol-extract", target: "insights" },
    { id: "e14", source: "insights", target: "review" },
    { id: "e15", source: "other", target: "continue" },
  ],
};

export const submissionIntake: FlowGraph = {
  nodes: [
    { id: "trigger", type: "custom", position: { x: 20, y: 20 }, data: { kind: "trigger", title: "Manual File Upload", subtitle: "trigger_manual_file_upload_1" } },
    { id: "ocr-loop", type: "custom", position: { x: 60, y: 110 }, data: { kind: "code", title: "ocr_all_files", subtitle: "For Loop" } },
    { id: "each-loop", type: "custom", position: { x: 60, y: 200 }, data: { kind: "code", title: "process_each_file", subtitle: "For Loop" } },

    { id: "loop", type: "group", position: { x: 20, y: 280 }, data: { kind: "group", title: "", subtitle: "" }, style: { width: 1240, height: 470 } },
    { id: "loop-label", type: "custom", position: { x: 8, y: 6 }, parentId: "loop", extent: "parent", draggable: false, data: { kind: "code", title: "process_each_file", subtitle: "for each · body" } },

    { id: "overview", type: "custom", position: { x: 60, y: 50 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "submission_overview_extraction", prompt: "Extract the submission overview: named insured, effective dates, lines of business requested, and total insured value.", schema: `{ "type": "object", "properties": { "insured_name": { "type": "string" }, "effective_date": { "type": "string" }, "tiv": { "type": "number" } } }`, model: "NXT Extract" } },
    { id: "validate", type: "custom", position: { x: 260, y: 50 }, parentId: "loop", extent: "parent", data: { kind: "code", title: "Custom Code", subtitle: "validate_fields" } },
    { id: "insights", type: "custom", position: { x: 450, y: 50 }, parentId: "loop", extent: "parent", data: { kind: "insights", title: "Insights", subtitle: "final_insights" } },
    { id: "review", type: "custom", position: { x: 630, y: 50 }, parentId: "loop", extent: "parent", data: { kind: "review", title: "Review", subtitle: "manual_review_required" } },
    { id: "complete", type: "custom", position: { x: 850, y: 20 }, parentId: "loop", extent: "parent", data: { kind: "action", title: "Mark Item as Complete", subtitle: "mark_item_as_complete" } },
    { id: "cancelled", type: "custom", position: { x: 850, y: 100 }, parentId: "loop", extent: "parent", data: { kind: "action", title: "Review Cancelled", subtitle: "review_cancelled" } },

    { id: "classify", type: "custom", position: { x: 60, y: 250 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "classification_step", prompt: "Classify this submission document into one of: SOV, loss runs, census, supplemental application, ACORD, correspondence, e-mods, other.", schema: `{ "type": "object", "properties": { "doc_type": { "type": "string" } } }`, model: "NXT Extract" } },
    { id: "switch", type: "custom", position: { x: 260, y: 250 }, parentId: "loop", extent: "parent", data: { kind: "switch", title: "Switch", subtitle: "conditional_switch" } },

    { id: "sov", type: "custom", position: { x: 480, y: 150 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "sov_extraction", prompt: "Extract the schedule of values: per-location TIV, construction, occupancy, protection, exposure.", schema: `{ "type": "object", "properties": { "locations": { "type": "array" } } }`, model: "NXT Extract" } },
    { id: "lossruns", type: "custom", position: { x: 480, y: 205 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "loss_runs_extraction", prompt: "Extract claim history: claim number, date of loss, paid, reserved, status.", schema: `{ "type": "object", "properties": { "claims": { "type": "array" } } }`, model: "NXT Extract" } },
    { id: "census", type: "custom", position: { x: 480, y: 260 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "census_extraction", prompt: "Extract employee census: class code, headcount, payroll, state.", schema: `{ "type": "object", "properties": { "classes": { "type": "array" } } }`, model: "NXT Extract" } },
    { id: "supplemental", type: "custom", position: { x: 480, y: 315 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "supplemental_application_extraction", prompt: "Extract supplemental application answers and any underwriting disclosures.", schema: `{ "type": "object", "properties": { "answers": { "type": "object" } } }`, model: "NXT Extract" } },
    { id: "acord", type: "custom", position: { x: 480, y: 370 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "acord_extraction", subtitle: "Custom", prompt: "Extract standard ACORD form fields.", schema: `{ "type": "object", "properties": { "acord_type": { "type": "string" } } }`, model: "NXT Extract" } },
    { id: "corr", type: "custom", position: { x: 480, y: 425 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "correspondence_extraction", prompt: "Summarize broker correspondence and extract any stated underwriting requests.", schema: `{ "type": "object", "properties": { "summary": { "type": "string" } } }`, model: "NXT Extract" } },
    { id: "other", type: "custom", position: { x: 480, y: 480 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "other_document_extraction", prompt: "Summarize the document contents.", schema: `{ "type": "object", "properties": { "summary": { "type": "string" } } }`, model: "NXT Extract" } },

    { id: "emod-header", type: "custom", position: { x: 250, y: 400 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "extract_emod_header", prompt: "Extract the experience modification header: rating effective date, state, risk ID.", schema: `{ "type": "object", "properties": { "risk_id": { "type": "string" } } }`, model: "NXT Extract" } },
    { id: "emod-class", type: "custom", position: { x: 250, y: 455 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "extract_emod_class_codes", prompt: "Extract NCCI class codes with expected and actual losses.", schema: `{ "type": "object", "properties": { "class_codes": { "type": "array" } } }`, model: "NXT Extract" } },
    { id: "emod-subtotals", type: "custom", position: { x: 250, y: 510 }, parentId: "loop", extent: "parent", data: { kind: "ai", title: "NXT Extract: Custom", subtitle: "extract_emod_policy_subtotals", prompt: "Extract policy-period subtotals from the e-mod worksheet.", schema: `{ "type": "object", "properties": { "subtotals": { "type": "array" } } }`, model: "NXT Extract" } },

    { id: "continue", type: "custom", position: { x: 1010, y: 250 }, parentId: "loop", extent: "parent", data: { kind: "code", title: "continue_to_next_step", subtitle: "Custom" } },
  ],
  edges: [
    { id: "s1", source: "trigger", target: "ocr-loop" },
    { id: "s2", source: "ocr-loop", target: "each-loop" },
    { id: "s3", source: "each-loop", target: "loop" },
    { id: "s4", source: "overview", target: "validate" },
    { id: "s5", source: "validate", target: "insights" },
    { id: "s6", source: "insights", target: "review" },
    { id: "s7", source: "review", target: "complete", label: "submit" },
    { id: "s8", source: "review", target: "cancelled", label: "cancel" },
    { id: "s9", source: "classify", target: "switch" },
    { id: "s10", source: "switch", target: "sov", label: "sov_case" },
    { id: "s11", source: "switch", target: "lossruns", label: "loss_runs_case" },
    { id: "s12", source: "switch", target: "census", label: "census_case" },
    { id: "s13", source: "switch", target: "supplemental", label: "supplemental_case" },
    { id: "s14", source: "switch", target: "acord", label: "acord_case" },
    { id: "s15", source: "switch", target: "corr", label: "correspondence_case" },
    { id: "s16", source: "switch", target: "other", label: "default" },
    { id: "s17", source: "switch", target: "emod-header", label: "emods_case" },
    { id: "s18", source: "emod-header", target: "emod-class" },
    { id: "s19", source: "emod-class", target: "emod-subtotals" },
    { id: "s20", source: "sov", target: "continue" },
    { id: "s21", source: "other", target: "continue" },
  ],
};

/* ------------------------------------------------------------------ *
 * Compact builders for the remaining flow graphs
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

/* ----------------------------- WC Premium Audit ----------------------------- */
const wcPremiumAudit: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "Manual File Upload", "audit_packet_upload"),
    n("ocr", 230, 40, "action", "OCR Attachments", "ocr_audit_packet"),
    n("payroll", 440, 40, "ai", "NXT Extract: Custom", "extract_payroll_records", {
      prompt:
        "Extract every payroll record from the audit packet: employee class description, NCCI class code if stated, gross payroll, state, and period covered.",
      schema: S('    "records": { "type": "array" },\n    "period_start": { "type": "string", "format": "date" },\n    "period_end": { "type": "string", "format": "date" }'),
    }),
    n("ncci", 680, 40, "action", "HTTP", "ncci_class_code_lookup"),
    n("validate", 900, 40, "code", "Custom Code", "validate_class_assignments"),
    n("recompute", 1120, 40, "code", "Custom Code", "recompute_earned_premium"),

    n("variance", 900, 190, "switch", "Switch", "premium_variance_band"),
    n("insights", 660, 300, "insights", "Insights", "audit_findings_briefing"),
    n("review", 900, 300, "review", "Review", "auditor_review_required"),
    n("complete", 1150, 260, "action", "Mark Item as Complete", "post_audit_result"),
    n("dispute", 1150, 350, "action", "Mark Item as Complete", "flag_for_dispute"),
  ],
  edges: [
    e("w1", "trigger", "ocr"),
    e("w2", "ocr", "payroll"),
    e("w3", "payroll", "ncci"),
    e("w4", "ncci", "validate"),
    e("w5", "validate", "recompute"),
    e("w6", "recompute", "variance"),
    e("w7", "variance", "complete", "within ±10%"),
    e("w8", "variance", "insights", "over ±10%"),
    e("w9", "insights", "review"),
    e("w10", "review", "complete", "approve"),
    e("w11", "review", "dispute", "dispute"),
  ],
};

/* ------------------- Commercial Auto Endorsement (STP) ------------------- */
const autoEndorsement: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "Outlook Trigger", "endorsement_requests_inbox"),
    n("download", 230, 40, "action", "Download Email", "download_email"),
    n("ocr", 440, 40, "action", "OCR Attachments", "ocr_attachments"),
    n("extract", 660, 40, "ai", "NXT Extract: Custom", "extract_endorsement_request", {
      prompt:
        "Extract the requested policy change: endorsement type, effective date, affected vehicles or drivers, and any stated premium impact.",
      schema: S('    "endorsement_type": { "type": "string" },\n    "effective_date": { "type": "string", "format": "date" },\n    "units": { "type": "array" }'),
    }),
    n("lookup", 890, 40, "action", "HTTP", "policy_lookup"),
    n("rules", 1110, 40, "code", "Field Validation", "eligibility_rules"),

    n("stp", 890, 190, "switch", "Switch", "straight_through_eligible"),
    n("update", 1140, 150, "action", "Update Claim", "apply_endorsement"),
    n("complete", 1360, 150, "action", "Mark Item as Complete", "mark_item_as_complete"),
    n("insights", 640, 300, "insights", "Insights", "endorsement_briefing"),
    n("review", 890, 300, "review", "Review", "underwriter_review"),
  ],
  edges: [
    e("a1", "trigger", "download"),
    e("a2", "download", "ocr"),
    e("a3", "ocr", "extract"),
    e("a4", "extract", "lookup"),
    e("a5", "lookup", "rules"),
    e("a6", "rules", "stp"),
    e("a7", "stp", "update", "auto-approve"),
    e("a8", "update", "complete"),
    e("a9", "stp", "insights", "needs review"),
    e("a10", "insights", "review"),
    e("a11", "review", "update", "approve"),
  ],
};

/* --------------------- FNOL: First Notice of Loss Intake --------------------- */
const fnolFirstNotice: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "Outlook Trigger", "fnol_intake_inbox"),
    n("download", 230, 40, "action", "Download Email", "download_email"),
    n("ocr", 440, 40, "action", "OCR Attachments", "ocr_attachments"),
    n("extract", 660, 40, "ai", "NXT Extract: Custom", "extract_fnol_fields", {
      prompt:
        "Extract first-notice-of-loss fields: claimant, date and time of loss, loss location, cause of loss, line of business, reported injuries, and involved parties.",
      schema: S('    "claimant": { "type": "string" },\n    "date_of_loss": { "type": "string", "format": "date" },\n    "cause_of_loss": { "type": "string" },\n    "injuries_reported": { "type": "boolean" }'),
    }),
    n("policy", 890, 40, "action", "Search Claim", "policy_match"),
    n("dupe", 1110, 40, "code", "Custom Code", "duplicate_claim_check"),

    n("severity", 890, 190, "switch", "Switch", "severity_routing"),
    n("reserve", 1140, 140, "code", "Custom Code", "compute_initial_reserve"),
    n("create", 1360, 140, "action", "Create Claim", "create_guidewire_claim"),
    n("complete", 1360, 230, "action", "Mark Item as Complete", "mark_item_as_complete"),

    n("insights", 640, 310, "insights", "Insights", "adjuster_briefing"),
    n("review", 890, 310, "review", "Review", "senior_adjuster_review"),
  ],
  edges: [
    e("f1", "trigger", "download"),
    e("f2", "download", "ocr"),
    e("f3", "ocr", "extract"),
    e("f4", "extract", "policy"),
    e("f5", "policy", "dupe"),
    e("f6", "dupe", "severity"),
    e("f7", "severity", "reserve", "low severity"),
    e("f8", "reserve", "create"),
    e("f9", "create", "complete"),
    e("f10", "severity", "insights", "BI / high severity"),
    e("f11", "insights", "review"),
    e("f12", "review", "reserve", "approve"),
  ],
};

/* ------------- Claim File Summarization & Reassignment Briefing ------------- */
const claimSummarization: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "Manual File Upload", "claim_file_upload"),
    n("ocr", 240, 40, "action", "OCR Attachments", "ocr_claim_file"),
    n("loop", 20, 140, "group", "", "", { width: 1180, height: 330 }),
    n("loop-label", 8, 6, "code", "summarize_each_document", "for each · body", { parentId: "loop" }),

    n("classify", 40, 60, "ai", "NXT Extract: Custom", "classify_document", {
      parentId: "loop",
      prompt: "Classify each document in the claim file: pleading, medical record, adjuster note, correspondence, expense, or evaluation.",
      schema: S('    "doc_type": { "type": "string" }'),
    }),
    n("timeline", 260, 60, "ai", "NXT Extract: Custom", "extract_timeline_events", {
      parentId: "loop",
      prompt: "Extract dated events from this document with a one-line description of each, suitable for a chronological claim timeline.",
      schema: S('    "events": { "type": "array" }'),
    }),
    n("financials", 260, 150, "ai", "NXT Extract: Custom", "extract_financials", {
      parentId: "loop",
      prompt: "Extract paid amounts, outstanding reserves, and expense entries referenced in this document.",
      schema: S('    "paid": { "type": "number" },\n    "reserve": { "type": "number" }'),
    }),
    n("actions", 260, 240, "ai", "NXT Extract: Custom", "extract_open_actions", {
      parentId: "loop",
      prompt: "Extract open action items, deadlines, and any statutory or court-imposed dates.",
      schema: S('    "actions": { "type": "array" },\n    "deadlines": { "type": "array" }'),
    }),
    n("merge", 520, 150, "code", "Custom Code", "merge_document_findings", { parentId: "loop" }),
    n("brief", 760, 150, "insights", "Insights", "reassignment_briefing", { parentId: "loop" }),
    n("review", 960, 150, "review", "Review", "supervisor_review", { parentId: "loop" }),

    n("complete", 400, 510, "action", "Mark Item as Complete", "publish_briefing"),
  ],
  edges: [
    e("c1", "trigger", "ocr"),
    e("c2", "ocr", "loop"),
    e("c3", "classify", "timeline"),
    e("c4", "classify", "financials"),
    e("c5", "classify", "actions"),
    e("c6", "timeline", "merge"),
    e("c7", "financials", "merge"),
    e("c8", "actions", "merge"),
    e("c9", "merge", "brief"),
    e("c10", "brief", "review"),
    e("c11", "loop", "complete"),
  ],
};

/* ------------ Carrier Rollover (Coverage Mapping & Gap Analysis) ------------ */
const carrierRollover: FlowGraph = {
  nodes: [
    n("trigger", 20, 40, "trigger", "Manual File Upload", "rollover_packet_upload"),
    n("ocr", 240, 40, "action", "OCR Attachments", "ocr_policies"),
    n("split", 460, 40, "code", "Custom Code", "split_expiring_vs_proposed"),

    n("expiring", 700, 20, "ai", "NXT Extract: Custom", "extract_expiring_coverages", {
      prompt: "Extract every coverage part, limit, sublimit, deductible, and endorsement from the expiring policy.",
      schema: S('    "coverages": { "type": "array" },\n    "carrier": { "type": "string" }'),
    }),
    n("proposed", 700, 120, "ai", "NXT Extract: Custom", "extract_proposed_coverages", {
      prompt: "Extract every coverage part, limit, sublimit, deductible, and endorsement from the proposed replacement policy.",
      schema: S('    "coverages": { "type": "array" },\n    "carrier": { "type": "string" }'),
    }),

    n("map", 950, 70, "code", "Custom Code", "map_corresponding_coverages"),
    n("gaps", 1170, 70, "ai", "NXT Extract: Custom", "gap_analysis", {
      prompt:
        "Compare mapped coverage pairs and identify reductions in limit, new or broadened exclusions, removed endorsements, and increased deductibles. Rank each gap by materiality.",
      schema: S('    "gaps": { "type": "array" },\n    "critical_count": { "type": "number" }'),
    }),

    n("severity", 950, 230, "switch", "Switch", "gap_severity"),
    n("insights", 700, 330, "insights", "Insights", "rollover_comparison_briefing"),
    n("review", 950, 330, "review", "Review", "broker_review_required"),
    n("complete", 1200, 290, "action", "Mark Item as Complete", "issue_comparison_report"),
  ],
  edges: [
    e("r1", "trigger", "ocr"),
    e("r2", "ocr", "split"),
    e("r3", "split", "expiring"),
    e("r4", "split", "proposed"),
    e("r5", "expiring", "map"),
    e("r6", "proposed", "map"),
    e("r7", "map", "gaps"),
    e("r8", "gaps", "severity"),
    e("r9", "severity", "complete", "no critical gaps"),
    e("r10", "severity", "insights", "critical gaps"),
    e("r11", "insights", "review"),
    e("r12", "review", "complete", "approve"),
  ],
};

/* --------- Claims Indexing (62-Category Document Classification) --------- */
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

/* ------------------------------------------------------------------ *
 * Southeast Asia flows
 * ------------------------------------------------------------------ */

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
  // retained reference graphs
  "fnol-coverage-analysis": fnolCoverageAnalysis,
  "submission-intake-underwriting": submissionIntake,
  "wc-premium-audit": wcPremiumAudit,
  "commercial-auto-endorsement": autoEndorsement,
  "fnol-first-notice": fnolFirstNotice,
  "claim-file-summarization": claimSummarization,
  "carrier-rollover": carrierRollover,
};
