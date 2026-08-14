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

export const itemDetails: Record<string, ItemDetail> = {
  "fnol-2231": {
    breadcrumb: "FNOL Claim Setup",
    banner: "from-[oklch(0.42_0.12_45)] to-[oklch(0.32_0.10_38)]",
    bannerEyebrow: "BI Severity — senior adjuster recommended",
    bannerTitle: "Third-Party Bodily Injury with Potential Subrogation",
    bannerBody:
      "Claimant vehicle driver (non-employee of insured) reported lower-back and neck injuries at scene, transported to Bellevue. Preliminary police narrative identifies Oakwood driver at fault (failure to yield). Initial reserve reflects medical exposure plus property damage; assign to senior BI adjuster with subrogation experience.",
    confidence: 94,
    recommendationTitle: "Activate Claim and Assign",
    recommendationBody:
      "Coverage verified against policy BA-778421-06. No exclusions apply. Initial reserve computed. Acknowledgment letter drafted for claimant. Ready to push to claims system on your approval.",
    stats: [
      { label: "Claim Reserve", value: "$95K" },
      { label: "Loss Date", value: "04/21/2026" },
      { label: "BI Severity", value: "HI", accent: true },
    ],
    keyInsights: [
      { title: "Coverage Verification · Confirmed", detail: "Policy active, no exclusions, $1M/$1M BI limits intact", tone: "success" },
      { title: "Initial Reserve · $95,000", detail: "Medical $60K · Property $15K · Expense $20K", tone: "primary" },
      { title: "Compliance Timers · 3 Active", detail: "NY 30-day acknowledgment, ISO reporting, reserve review", tone: "warning" },
      { title: "Assignment Recommendation · Priya Venkatesh", detail: "Senior BI adjuster, NY metro, 14-case capacity", tone: "info" },
    ],
    narratives: [
      {
        heading: "Loss Narrative",
        sections: [
          {
            eyebrow: "Summary from police report",
            body: "Three-vehicle collision occurred 04/21/2026 at approximately 14:32 hours at the intersection of 5th Avenue and Broadway, New York, NY. Oakwood Enterprises vehicle (2023 Freightliner M2 106, VIN ending 8821, operated by employee driver Marcus T. Anderson) was proceeding southbound on 5th Avenue. Claimant vehicle (2019 Toyota Camry, operated by Jane Mary Smith) was proceeding eastbound on Broadway. Third vehicle (2021 Honda CR-V, operated by uninvolved third party) was stationary at the eastbound red light.",
          },
          {
            eyebrow: "Fault preliminary assessment",
            body: "Responding officer Officer Thorne noted Oakwood driver failed to yield during left-turn maneuver. No citations issued at scene pending full investigation. Evidence at the scene — including vehicle resting positions, debris field, and skid measurements — suggests the Oakwood vehicle entered the intersection against protected-left signal guidance.",
          },
          {
            eyebrow: "Injuries and property",
            body: "Claimant Jane Mary Smith reported neck and lower-back pain at the scene and was transported by FDNY EMS to Bellevue Hospital emergency department. Third-party driver declined medical attention. Oakwood driver reported no injuries. Property damage: claimant Camry sustained severe front-end damage consistent with T-bone impact and is likely a total loss. Oakwood truck sustained moderate passenger-side front-end damage, drivable from scene.",
          },
        ],
      },
      {
        heading: "Coverage Analysis",
        sections: [
          {
            eyebrow: "Policy status",
            body: "Commercial auto policy BA-778421-06 issued to Oakwood Enterprises is active and in force as of the date of loss. Policy effective dates 01/15/2026 through 01/15/2027. Premium current through Q2 2026. No lapse in coverage, no reinstatement flags, no pending cancellation notices.",
          },
          {
            eyebrow: "Driver and vehicle coverage",
            body: "Employee driver Marcus T. Anderson is listed as a scheduled driver on the policy, with a clean MVR at binding. The 2023 Freightliner M2 106 (VIN ending 8821) is listed as scheduled unit #3 on the vehicle schedule. Loss occurred while driver was on a dispatched delivery route within the course and scope of employment — confirmed via dispatch log timestamp matching GPS telematics at scene.",
          },
          {
            eyebrow: "Applicable limits",
            body: "Bodily Injury: $1,000,000 per person / $1,000,000 per accident — no aggregate erosion during current policy period. Property Damage: $1,000,000 per accident. Uninsured Motorist: $1,000,000 (not applicable — claimant is third-party, not insured). Medical Payments: $5,000 per person. No applicable exclusions identified.",
          },
        ],
      },
    ],
    sourceDocs: [
      { name: "FNOL_Intake_Form.pdf", kind: "Application", size: "0.9MB", ext: "PDF" },
      { name: "Police_Report_NY-8829-XJ.pdf", kind: "Loss Evidence", size: "2.1MB", ext: "PDF" },
      { name: "Scene_Photos.zip", kind: "Loss Evidence", size: "14.8MB", ext: "ZIP" },
      { name: "Policy_Declaration_BA-778421-06.pdf", kind: "Policy", size: "1.3MB", ext: "PDF" },
      { name: "AI_Drafted_Ack_Letter.pdf", kind: "Communications", size: "0.4MB", ext: "PDF" },
    ],
    audit: [
      { date: "Apr 22", label: "AI extraction", active: true },
      { date: "Apr 22", label: "System ingested FNOL intake and police report" },
      { date: "Apr 22", label: "System received FNOL email from broker portal" },
    ],
    completion: 78,
    groups: [
      {
        name: "Claimant Information",
        filled: 5,
        total: 6,
        warnings: 1,
        fields: [
          ok("Full Name", "Jane Mary Smith"),
          verify(
            "Date of Birth",
            "02/14/1967",
            'AI assistant detected a wrong date format — day value "22" exceeds max 31 as originally extracted; corrected to 02/14/1967 via context'
          ),
          ok("Phone", "(917) 555-0312"),
          ok("Address", "482 W 144th St Apt 4B, New York, NY 10031"),
          ok("Email", "jmsmith.nyc@gmail.com"),
          ok("SSN (last 4)", "****-2183"),
        ],
      },
      {
        name: "Insured & Driver Information",
        filled: 8,
        total: 8,
        fields: [
          ok("Named Insured", "Oakwood Enterprises Inc."),
          ok("FEIN", "31-4429871"),
          ok("Insured Phone", "(718) 555-0441"),
          ok("Driver Name", "Marcus T. Anderson"),
          ok("Driver License #", "NY-S4921883"),
          ok("Scheduled on Policy", "Yes"),
          ok("On Dispatched Route", "Yes — verified via GPS telematics"),
          ok("Driver Injuries", "None reported"),
        ],
      },
      {
        name: "Loss Details",
        filled: 7,
        total: 9,
        warnings: 2,
        fields: [
          ok("Date of Loss", "04/21/2026", [1, 2]),
          ok("Time of Loss", "14:32"),
          ok("Loss Location", "Intersection of 5th Ave & Broadway, NY, NY"),
          ok("Loss Type", "Auto Collision — BI + PD"),
          ok("Police Report #", "NY-8829-XJ"),
          ok("# of Vehicles Involved", "3"),
          ok("Weather Conditions", "Clear, dry pavement"),
          verify(
            "Citation Issued",
            "None at scene — investigation pending",
            "Monitor for supplemental citation in coming days"
          ),
          verify(
            "Preliminary Fault",
            "Insured driver (failure to yield)",
            "Preliminary only — confirm with investigator report"
          ),
        ],
      },
      {
        name: "Vehicles & Property",
        filled: 7,
        total: 8,
        warnings: 1,
        fields: [
          ok("Insured Vehicle Year", "2023"),
          ok("Make / Model", "Freightliner M2 106"),
          ok("VIN (last 4)", "8821"),
          ok("Insured Vehicle Damage", "Moderate passenger-side front-end; drivable"),
          ok("Claimant Vehicle Year", "2019"),
          ok("Make / Model", "Toyota Camry"),
          ok("License Plate", "NY-GNE-4419"),
          verify(
            "Claimant Vehicle Damage",
            "Severe front-end — likely total loss",
            "Total-loss determination requires appraisal; scheduled for 04/24"
          ),
        ],
      },
      {
        name: "Coverage & Reserves",
        filled: 9,
        total: 10,
        warnings: 1,
        fields: [
          ok("Policy Number", "BA-778421-06"),
          ok("Policy Effective", "01/15/2026"),
          ok("Policy Expiration", "01/15/2027"),
          ok("BI Limit (per person / occ)", "$1,000,000 / $1,000,000"),
          ok("PD Limit (per occ)", "$1,000,000"),
          ok("Deductible", "$1,000"),
          ok("Medical Reserve", "$60,000"),
          ok("Property Damage Reserve", "$15,000"),
          ok("Expense Reserve", "$20,000"),
          verify("Subrogation Potential", "Likely — third-party at fault", "Confirm after investigator report"),
        ],
      },
    ],
  },

  "ci-8801": {
    breadcrumb: "Claims Indexing",
    banner: "from-primary to-[oklch(0.34_0.10_190)]",
    bannerEyebrow: "Indexing complete — 1 low-confidence flag",
    bannerTitle: "6-Component Bundle Classified · One Demand Edge Case Surfaced",
    bannerBody:
      "An inbound bundle on CLM-2024-118827 (Smith v. Stoltz Trucking) arrived this morning across two channels — a 4-message email thread with 3 attachments, plus a 7-page fax that split into 3 component documents. The AI Agent classified all six components against the 62-category indexing taxonomy and pulled the five universal claim-tying fields on every component.",
    confidence: 94,
    recommendationTitle: "Approve Indexing — Resolve One Demand Flag",
    recommendationBody:
      "Five of six components are unambiguous. The email body sits between 'First Notice of Demand' and 'Demand — Correspondence' (the formal Demand_Letter.pdf attachment carries the same demand). Confirm or override, then push all six to Guidewire.",
    stats: [
      { label: "Components", value: "6" },
      { label: "Avg Confidence", value: "92%" },
      { label: "Flags", value: "1", accent: true },
    ],
    keyInsights: [
      { title: "Classification Output · 6 Components, 6 Distinct Categories", detail: "4 Legal · 2 Medical · 1 Report — all on CLM-2024-118827", tone: "success" },
      { title: "Universal Field Extraction · 5/5 on Every Component", detail: "Claim # · Claimant · DOL · Policy # · Policyholder", tone: "primary" },
      { title: "Edge Case · Email Body Demand vs. Correspondence", detail: "0.71 confidence — Demand class is held by the attachment", tone: "warning" },
      { title: "Bundle Split · 14 Pages → 6 Component Documents", detail: "Email + 3 attachments + fax split into 3 components", tone: "info" },
    ],
    narratives: [
      {
        heading: "Bundle Narrative",
        sections: [
          {
            eyebrow: "Inbound channels",
            body: "Two inbound channels arrived between 7:42 AM and 8:11 AM ET on 05/05/2026. Channel one: an email from Marcus T. Wexler (Wexler Law Firm) at marcus@wexlerlaw.com to claims-intake@nxtloom-demo.com with subject 'DEMAND — Smith v. Stoltz Trucking — CLM-2024-118827' and three PDF attachments totaling 11 pages. Channel two: a 7-page fax from 215-555-0142 (also Wexler Law Firm) received at 8:11 AM.",
          },
          {
            eyebrow: "AI splitting logic",
            body: "The AI Agent's mailroom processor matched both channels via subject + attorney + claim number cross-references and grouped them into a single bundle for indexing. The 7-page fax was split into three component documents at detected document boundaries — a notice of representation, a medical narrative, and a billing summary.",
          },
        ],
      },
    ],
    sourceDocs: [
      { name: "Email_Wexler_Demand_Thread.eml", kind: "Communications", size: "0.1MB", ext: "EML" },
      { name: "Demand_Letter.pdf", kind: "Legal", size: "0.4MB", ext: "PDF" },
      { name: "Medical_Narrative_DrPatel.pdf", kind: "Medical", size: "0.6MB", ext: "PDF" },
      { name: "Medical_Bills_Riverside.pdf", kind: "Medical", size: "0.3MB", ext: "PDF" },
      { name: "Police_Report_PA-2026-04412.pdf", kind: "Legal", size: "0.5MB", ext: "PDF" },
      { name: "NoR_Wexler.pdf", kind: "Legal", size: "0.2MB", ext: "PDF" },
    ],
    audit: [
      { date: "May 5", label: "AI classification complete — 1 flag raised", active: true },
      { date: "May 5", label: "System split 14-page bundle into 6 components" },
      { date: "May 5", label: "System matched fax to email thread on claim number" },
    ],
    completion: 92,
    groups: [
      {
        name: "Universal Claim-Tying Fields",
        filled: 5,
        total: 5,
        fields: [
          ok("Claim Number", "CLM-2024-118827", [1, 2, 3]),
          ok("Claimant Name", "Daniel R. Smith", [1, 2, 3]),
          ok("Date of Loss", "11/14/2024", [1, 2, 3]),
          ok("Policy Number", "CGL-PA-7711-04", [1, 2, 3]),
          ok("Policyholder", "Stoltz Trucking & Logistics LLC", [1, 2, 3]),
        ],
      },
      {
        name: "Component 1 · Demand_Letter.pdf → Legal – First Notice of Demand",
        filled: 10,
        total: 11,
        warnings: 1,
        fields: [
          ok("AI Classification", "Legal – First Notice of Demand"),
          ok("Inbound Channel", "Email attachment"),
          ok("Demand Amount", "$385,000"),
          ok("Demand Deadline", "05/19/2026"),
          ok("Attorney of Record", "Marcus T. Wexler"),
          ok("Firm", "Wexler Law Firm"),
          ok("Bar Number", "PA-88214"),
          ok("Page Count", "4"),
          ok("Signature Present", "Yes"),
          ok("Certified Mail", "No — email delivery"),
          verify(
            "Email Body Classification",
            "Demand — Correspondence",
            "0.71 confidence — email body reiterates the demand carried by the attachment; confirm or override"
          ),
        ],
      },
      {
        name: "Component 2 · NoR_Wexler.pdf → Legal – Notice of Representation",
        filled: 8,
        total: 8,
        fields: [
          ok("AI Classification", "Legal – Notice of Representation"),
          ok("Inbound Channel", "Fax (split)"),
          ok("Representation Date", "05/01/2026"),
          ok("Attorney of Record", "Marcus T. Wexler"),
          ok("Client", "Daniel R. Smith"),
          ok("Scope", "All claims arising from 11/14/2024 loss"),
          ok("Page Count", "2"),
          ok("Signature Present", "Yes"),
        ],
      },
      {
        name: "Component 3 · Medical_Narrative_DrPatel.pdf → Medical – Narrative Report",
        filled: 9,
        total: 10,
        warnings: 1,
        fields: [
          ok("AI Classification", "Medical – Narrative Report"),
          ok("Inbound Channel", "Email attachment"),
          ok("Provider", "Dr. Anish Patel, MD"),
          ok("Facility", "Riverside Orthopedic Associates"),
          ok("Treatment Start", "11/16/2024"),
          ok("Treatment End", "03/28/2026"),
          ok("Primary Diagnosis", "Lumbar disc herniation L4-L5"),
          ok("Secondary Diagnosis", "Cervical strain"),
          ok("Page Count", "5"),
          verify("Permanency Opinion", "Stated — 12% whole person", "Requires IME confirmation before reserve adjustment"),
        ],
      },
    ],
  },
};

/* ------------------------------------------------------------------ *
 * Remaining bespoke item details
 * ------------------------------------------------------------------ */

const additionalDetails: Record<string, ItemDetail> = {
  "rol-7100": {
    breadcrumb: "Carrier Rollover",
    banner: "from-[oklch(0.40_0.11_150)] to-[oklch(0.30_0.09_158)]",
    bannerEyebrow: "3 critical gaps — broker sign-off required",
    bannerTitle: "Stated Non-Renewal · 287-Page Policy Mapped in 4 Minutes",
    bannerBody:
      "Pinewood HVAC received a stated non-renewal from Stated Mutual. The proposed AcrossCountry replacement was mapped coverage-by-coverage against the expiring form. 41 of 44 coverage parts map cleanly; three carry material reductions the insured has not been told about yet.",
    confidence: 89,
    recommendationTitle: "Do Not Bind — Escalate Three Gaps",
    recommendationBody:
      "The replacement drops professional liability entirely, halves the pollution sublimit, and adds a residential-work exclusion that touches roughly 18% of Pinewood's book. Present the comparison to the insured before binding.",
    stats: [
      { label: "Coverages Mapped", value: "41/44" },
      { label: "Critical Gaps", value: "3", accent: true },
      { label: "Premium Delta", value: "−$8.2K" },
    ],
    keyInsights: [
      { title: "Coverage Mapping · 41 of 44 Parts Aligned", detail: "Three parts have no corresponding coverage in the proposed form", tone: "success" },
      { title: "Critical Gap · Professional Liability Removed", detail: "Expiring carried $1M E&O for design-assist work; proposed form has none", tone: "warning" },
      { title: "Critical Gap · Pollution Sublimit Halved", detail: "$500K reduced to $250K — refrigerant release exposure", tone: "warning" },
      { title: "Premium Delta · $8,200 Lower", detail: "Savings are largely attributable to the removed coverages", tone: "info" },
    ],
    narratives: [
      {
        heading: "Rollover Narrative",
        sections: [
          {
            eyebrow: "Why this rollover exists",
            body: "Stated Mutual issued a stated non-renewal effective 06/30/2026 citing adverse loss experience in the HVAC contracting class rather than any account-specific loss activity. Pinewood HVAC has had no claims in the current period. The broker sourced a replacement quote from AcrossCountry Insurance on a manuscript CGL form.",
          },
          {
            eyebrow: "Mapping methodology",
            body: "The agent parsed the 287-page expiring policy and the 141-page proposed policy, normalized both into coverage parts, then paired them on coverage intent rather than form number — necessary because AcrossCountry uses a manuscript form with different section ordering. Each pair was compared on limit, sublimit, deductible, and attached endorsements.",
          },
          {
            eyebrow: "Material findings",
            body: "Professional liability (design-assist E&O, $1M occurrence) appears in the expiring policy via endorsement CG-7741 and has no counterpart in the proposal. Pollution liability sublimit drops from $500,000 to $250,000. A new residential-work exclusion (AC-EXCL-22) has no expiring counterpart and would exclude an estimated 18% of Pinewood's revenue by their own stated work mix.",
          },
        ],
      },
    ],
    sourceDocs: [
      { name: "Expiring_Policy_Stated_Mutual.pdf", kind: "Policy", size: "18.4MB", ext: "PDF" },
      { name: "Proposed_AcrossCountry.pdf", kind: "Policy", size: "9.1MB", ext: "PDF" },
      { name: "Non_Renewal_Notice.pdf", kind: "Communications", size: "0.2MB", ext: "PDF" },
      { name: "Coverage_Comparison.xlsx", kind: "Analysis", size: "0.6MB", ext: "XLSX" },
    ],
    audit: [
      { date: "Apr 27", label: "AI gap analysis — 3 critical", active: true },
      { date: "Apr 27", label: "System mapped 44 coverage parts" },
      { date: "Apr 27", label: "Broker uploaded rollover packet" },
    ],
    completion: 84,
    groups: [
      {
        name: "Account & Carriers",
        filled: 6,
        total: 6,
        fields: [
          ok("Named Insured", "Pinewood HVAC Services LLC"),
          ok("Expiring Carrier", "Stated Mutual"),
          ok("Proposed Carrier", "AcrossCountry Insurance"),
          ok("Expiring Policy #", "SM-CGL-441822"),
          ok("Non-Renewal Effective", "06/30/2026"),
          ok("Proposed Effective", "07/01/2026"),
        ],
      },
      {
        name: "Critical Gaps",
        filled: 2,
        total: 3,
        warnings: 3,
        fields: [
          verify("Professional Liability", "Removed — no counterpart", "Expiring endorsement CG-7741 carried $1M design-assist E&O"),
          verify("Pollution Sublimit", "$500,000 → $250,000", "50% reduction; confirm refrigerant exposure with insured"),
          verify("Residential Work Exclusion", "Added — AC-EXCL-22", "Estimated 18% of stated revenue would fall outside coverage"),
        ],
      },
      {
        name: "Premium & Terms",
        filled: 5,
        total: 5,
        fields: [
          ok("Expiring Premium", "$94,700"),
          ok("Proposed Premium", "$86,500"),
          ok("Premium Delta", "−$8,200 (−8.7%)"),
          ok("Expiring Deductible", "$5,000"),
          ok("Proposed Deductible", "$5,000"),
        ],
      },
    ],
  },

  "end-3204": {
    breadcrumb: "Endorsement Processing",
    banner: "from-[oklch(0.40_0.15_18)] to-[oklch(0.31_0.12_14)]",
    bannerEyebrow: "Straight-through eligible — 1 rule blocked",
    bannerTitle: "Fleet Schedule Endorsement · 6 Units Added, 1 Held",
    bannerBody:
      "Cascade Pacific Energy Cooperative requested six vehicles added to their commercial auto schedule effective 04/01/2026. Five units pass every eligibility rule and can post straight through. The sixth is a specialty crane truck above the auto-bind GVWR ceiling and needs underwriter sign-off.",
    confidence: 96,
    recommendationTitle: "Post Five Units — Refer One",
    recommendationBody:
      "Units 1–5 satisfy vehicle age, GVWR, radius, and driver-MVR rules. Unit 6 (2024 Manitex crane truck, 62,000 lb GVWR) exceeds the 33,000 lb auto-bind ceiling. Approve to post the five and route unit 6 to the specialty auto desk.",
    stats: [
      { label: "Units Requested", value: "6" },
      { label: "Auto-Bind", value: "5" },
      { label: "Referred", value: "1", accent: true },
    ],
    keyInsights: [
      { title: "Eligibility Rules · 5 of 6 Units Pass", detail: "Vehicle age, radius, and MVR checks clear on units 1–5", tone: "success" },
      { title: "Premium Impact · +$14,280 Annualized", detail: "Pro-rated to $10,710 for the remaining policy term", tone: "primary" },
      { title: "Referral · Unit 6 Exceeds GVWR Ceiling", detail: "62,000 lb crane truck vs. 33,000 lb auto-bind limit", tone: "warning" },
      { title: "Driver Check · All Assigned Drivers Clear", detail: "6 MVRs pulled, no violations in 36 months", tone: "info" },
    ],
    narratives: [
      {
        heading: "Endorsement Narrative",
        sections: [
          {
            eyebrow: "Request summary",
            body: "Received 03/28/2026 from Cascade Pacific's fleet manager via the broker portal, requesting six additions to the scheduled auto coverage on policy CA-OR-748291-25 with an effective date of 04/01/2026. The request included the fleet manager's signed schedule addendum and copies of six vehicle registrations.",
          },
          {
            eyebrow: "Automated eligibility check",
            body: "Each unit was checked against the straight-through endorsement ruleset: model year within 10 years, GVWR at or below 33,000 lb, garaging radius within the rated territory, and an assigned driver with a clean 36-month MVR. Units 1–5 (three Ford F-350s, one Ram 5500, one Freightliner M2) pass all four rules. Unit 6 fails the GVWR rule only.",
          },
        ],
      },
    ],
    sourceDocs: [
      { name: "Endorsement_Request_Signed.pdf", kind: "Application", size: "0.5MB", ext: "PDF" },
      { name: "Vehicle_Registrations.pdf", kind: "Supporting", size: "2.2MB", ext: "PDF" },
      { name: "MVR_Batch_Results.pdf", kind: "Supporting", size: "0.8MB", ext: "PDF" },
      { name: "Broker_Cover_Email.eml", kind: "Communications", size: "0.1MB", ext: "EML" },
    ],
    audit: [
      { date: "Mar 28", label: "AI eligibility check — 1 referral", active: true },
      { date: "Mar 28", label: "System pulled 6 MVRs" },
      { date: "Mar 28", label: "Broker submitted endorsement request" },
    ],
    completion: 94,
    groups: [
      {
        name: "Policy & Request",
        filled: 5,
        total: 5,
        fields: [
          ok("Named Insured", "Cascade Pacific Energy Cooperative"),
          ok("Policy Number", "CA-OR-748291-25"),
          ok("Endorsement Type", "Fleet Schedule — Vehicle Addition"),
          ok("Requested Effective", "04/01/2026"),
          ok("Requested By", "Dana Whitfield, Fleet Manager"),
        ],
      },
      {
        name: "Units & Eligibility",
        filled: 5,
        total: 6,
        warnings: 1,
        fields: [
          ok("Unit 1", "2022 Ford F-350 · 11,400 lb · PASS"),
          ok("Unit 2", "2023 Ford F-350 · 11,400 lb · PASS"),
          ok("Unit 3", "2021 Ford F-350 · 11,400 lb · PASS"),
          ok("Unit 4", "2023 Ram 5500 · 19,500 lb · PASS"),
          ok("Unit 5", "2022 Freightliner M2 · 26,000 lb · PASS"),
          verify("Unit 6", "2024 Manitex Crane Truck · 62,000 lb", "Exceeds 33,000 lb auto-bind ceiling — refer to specialty auto desk"),
        ],
      },
      {
        name: "Premium",
        filled: 4,
        total: 4,
        fields: [
          ok("Annualized Premium (Units 1–5)", "$14,280"),
          ok("Pro-Rated to Term", "$10,710"),
          ok("Remaining Term", "9 months"),
          ok("Billing Method", "Endorsement bill — direct"),
        ],
      },
    ],
  },

  "pa-5501": {
    breadcrumb: "WC Premium Audit",
    banner: "from-primary to-[oklch(0.34_0.10_190)]",
    bannerEyebrow: "1 required document missing",
    bannerTitle: "Annual Audit · $41,900 Additional Premium Indicated",
    bannerBody:
      "Peachtree Foundations' annual workers' compensation audit shows payroll 34% above the estimate used at binding, driven by growth in the concrete-construction class. Class-code assignments were verified against NCCI. One required document — the subcontractor certificate file — was not supplied.",
    confidence: 88,
    recommendationTitle: "Request Subcontractor Certificates Before Billing",
    recommendationBody:
      "The additional premium calculation is sound, but $180,400 of the reported payroll sits in a subcontractor bucket with no certificates of insurance on file. Uninsured subs would reclassify to a higher-rated code and change the result materially.",
    stats: [
      { label: "Additional Premium", value: "$41.9K" },
      { label: "Payroll Variance", value: "+34%" },
      { label: "Missing Docs", value: "1", accent: true },
    ],
    keyInsights: [
      { title: "Class Codes Verified · 4 of 4 Against NCCI", detail: "5213, 5606, 8810, 8742 — all current for GA", tone: "success" },
      { title: "Payroll Variance · +$1.24M Over Estimate", detail: "Concrete construction (5213) accounts for 78% of the increase", tone: "primary" },
      { title: "Missing · Subcontractor Certificates", detail: "$180,400 in sub payroll with no COI on file", tone: "warning" },
      { title: "Experience Mod · Unchanged at 0.94", detail: "No impact on the audit result", tone: "info" },
    ],
    narratives: [
      {
        heading: "Audit Narrative",
        sections: [
          {
            eyebrow: "Scope and period",
            body: "Annual premium audit covering policy period 04/01/2025 through 04/01/2026 for Peachtree Foundations LLC, a Georgia concrete-construction contractor. The audit packet comprised quarterly 941s, the state unemployment filings, a general ledger extract, and a payroll register by employee.",
          },
          {
            eyebrow: "Payroll findings",
            body: "Total audited payroll of $4,876,200 against an estimated $3,632,000 at binding — a variance of $1,244,200 or 34%. The increase is concentrated in class 5213 (concrete construction NOC), consistent with the insured's stated addition of two crews during the period. Clerical (8810) and outside sales (8742) payroll tracked close to estimate.",
          },
          {
            eyebrow: "Open item",
            body: "The payroll register segregates $180,400 paid to subcontracted labor. Under Georgia rules, uninsured subcontractors are treated as employees of the insured and are rated at the governing class code rather than being excluded. Certificates of insurance were requested at audit and were not produced. Until produced, this payroll cannot be excluded.",
          },
        ],
      },
    ],
    sourceDocs: [
      { name: "Payroll_Register_FY25.pdf", kind: "Application", size: "3.4MB", ext: "PDF" },
      { name: "Quarterly_941s.pdf", kind: "Supporting", size: "1.1MB", ext: "PDF" },
      { name: "GA_SUTA_Filings.pdf", kind: "Supporting", size: "0.7MB", ext: "PDF" },
      { name: "General_Ledger_Extract.xlsx", kind: "Supporting", size: "2.8MB", ext: "XLSX" },
    ],
    audit: [
      { date: "Apr 20", label: "AI audit computation complete", active: true },
      { date: "Apr 20", label: "System verified 4 class codes against NCCI" },
      { date: "Apr 19", label: "Auditor uploaded payroll packet" },
    ],
    completion: 90,
    groups: [
      {
        name: "Account & Period",
        filled: 5,
        total: 5,
        fields: [
          ok("Named Insured", "Peachtree Foundations LLC"),
          ok("Policy Number", "WC-GA-551204"),
          ok("Audit Period", "04/01/2025 – 04/01/2026"),
          ok("State", "Georgia"),
          ok("Experience Mod", "0.94"),
        ],
      },
      {
        name: "Class Codes & Payroll",
        filled: 4,
        total: 5,
        warnings: 1,
        fields: [
          ok("5213 · Concrete Construction NOC", "$3,918,400"),
          ok("5606 · Project Manager", "$412,000"),
          ok("8810 · Clerical", "$298,600"),
          ok("8742 · Outside Sales", "$66,800"),
          verify("Subcontracted Labor", "$180,400 — class TBD", "No certificates of insurance on file; would rate at 5213 if uninsured"),
        ],
      },
      {
        name: "Premium Result",
        filled: 4,
        total: 4,
        fields: [
          ok("Estimated Annual Premium", "$123,400"),
          ok("Audited Annual Premium", "$165,300"),
          ok("Additional Premium Due", "$41,900"),
          ok("Payroll Variance", "+$1,244,200 (+34%)"),
        ],
      },
    ],
  },

  "sub-4471": {
    breadcrumb: "Submission Intake",
    banner: "from-[oklch(0.40_0.13_264)] to-[oklch(0.30_0.11_270)]",
    bannerEyebrow: "In appetite — quote-ready",
    bannerTitle: "CP + GL Submission · 3 Properties, $1.2M TIV",
    bannerBody:
      "Kings County Property Management submitted a commercial property and general liability package covering three Brooklyn and Queens multifamily buildings. All three locations sit inside appetite on construction, occupancy, protection, and exposure. Loss history is clean over five years.",
    confidence: 93,
    recommendationTitle: "Proceed to Quote",
    recommendationBody:
      "Appetite check clears on all three locations. No prior losses in the five-year loss run. Schedule of values totals reconcile to the ACORD 140 within tolerance. Ready for rating.",
    stats: [
      { label: "Total TIV", value: "$1.2M" },
      { label: "Locations", value: "3" },
      { label: "5-Yr Losses", value: "0" },
    ],
    keyInsights: [
      { title: "Appetite Check · All 3 Locations Clear", detail: "Joisted masonry, habitational, protected class 3", tone: "success" },
      { title: "Schedule of Values · Reconciled", detail: "Per-location TIV sums to $1,204,000 — matches ACORD 140", tone: "primary" },
      { title: "Loss History · Clean 5 Years", detail: "No claims reported across prior carriers", tone: "info" },
      { title: "Protection · All Within 500ft of Hydrant", detail: "PPC 3 for all three addresses", tone: "info" },
    ],
    narratives: [
      {
        heading: "Submission Narrative",
        sections: [
          {
            eyebrow: "Account overview",
            body: "Kings County Property Management LLC operates three multifamily residential buildings across Brooklyn and Queens totaling 34 units. The account is being marketed by Northbridge Brokerage for a 07/01/2026 effective date. Requested coverages are commercial property on a special-form replacement-cost basis and commercial general liability at $1M/$2M.",
          },
          {
            eyebrow: "Property characteristics",
            body: "All three buildings are joisted masonry construction, built between 1928 and 1961, with full roof replacements completed between 2019 and 2023. Each location is fully sprinklered and sits within 500 feet of a hydrant, supporting a protection class 3 rating. No location has a commercial cooking or dry-cleaning exposure on premises.",
          },
        ],
      },
    ],
    sourceDocs: [
      { name: "ACORD_140_Property.pdf", kind: "Application", size: "0.8MB", ext: "PDF" },
      { name: "ACORD_125_Commercial.pdf", kind: "Application", size: "0.6MB", ext: "PDF" },
      { name: "Schedule_of_Values.xlsx", kind: "Supporting", size: "0.3MB", ext: "XLSX" },
      { name: "Loss_Runs_5yr.pdf", kind: "Supporting", size: "0.4MB", ext: "PDF" },
    ],
    audit: [
      { date: "Apr 24", label: "AI appetite check — in appetite", active: true },
      { date: "Apr 24", label: "System reconciled schedule of values" },
      { date: "Apr 24", label: "Broker submitted via portal" },
    ],
    completion: 96,
    groups: [
      {
        name: "Account",
        filled: 5,
        total: 5,
        fields: [
          ok("Named Insured", "Kings County Property Management LLC"),
          ok("Producer", "Northbridge Brokerage"),
          ok("Requested Effective", "07/01/2026"),
          ok("Lines Requested", "Commercial Property, General Liability"),
          ok("Total Units", "34"),
        ],
      },
      {
        name: "Locations & Values",
        filled: 6,
        total: 6,
        fields: [
          ok("Loc 1 · 1284 Bedford Ave, Brooklyn", "$486,000 TIV · 1931 · JM"),
          ok("Loc 2 · 41-09 Greenpoint Ave, Queens", "$402,000 TIV · 1928 · JM"),
          ok("Loc 3 · 877 Nostrand Ave, Brooklyn", "$316,000 TIV · 1961 · JM"),
          ok("Total Insured Value", "$1,204,000"),
          ok("Protection Class", "3 (all locations)"),
          ok("Sprinklered", "Yes (all locations)"),
        ],
      },
      {
        name: "Underwriting",
        filled: 4,
        total: 4,
        fields: [
          ok("Appetite Result", "In appetite"),
          ok("5-Year Loss Count", "0"),
          ok("Requested GL Limits", "$1,000,000 / $2,000,000"),
          ok("Property Valuation", "Replacement cost, special form"),
        ],
      },
    ],
  },

  "clm-7731": {
    breadcrumb: "Claim File Summarization",
    banner: "from-[oklch(0.38_0.10_60)] to-[oklch(0.29_0.08_52)]",
    bannerEyebrow: "Reassignment briefing — 3 actions in 5 days",
    bannerTitle: "18-Month BI Claim · $47K Paid, Trial Date Set",
    bannerBody:
      "Marcus Anderson bodily injury claim is being reassigned following the prior adjuster's departure. The file spans 18 months and 412 pages. Three deadlines fall inside the next five business days, including an expert-disclosure cutoff that cannot be extended.",
    confidence: 91,
    recommendationTitle: "Accept Reassignment — Calendar Three Deadlines",
    recommendationBody:
      "The file is in reasonable order with no coverage issues outstanding. Immediate priority is the 05/02 expert disclosure deadline; the treating physician's IME report is not yet in the file and is required for that filing.",
    stats: [
      { label: "Paid to Date", value: "$47K" },
      { label: "Outstanding", value: "$128K" },
      { label: "Critical Actions", value: "3", accent: true },
    ],
    keyInsights: [
      { title: "Financial Position · $47K Paid, $128K Reserved", detail: "Medical $31K · Indemnity $9K · Expense $7K paid to date", tone: "primary" },
      { title: "Litigation Posture · Trial Set 09/14/2026", detail: "Discovery closes 06/30; mediation not yet scheduled", tone: "warning" },
      { title: "Critical Deadline · Expert Disclosure 05/02", detail: "IME report outstanding — cannot be extended under scheduling order", tone: "warning" },
      { title: "Coverage · No Open Issues", detail: "Coverage confirmed 11/2024, no reservation of rights", tone: "success" },
    ],
    narratives: [
      {
        heading: "Claim Chronology",
        sections: [
          {
            eyebrow: "Loss and early handling",
            body: "Rear-end collision on 10/18/2024 in Hartford, CT. Claimant Marcus Anderson, 44, reported cervical and lumbar injury and was treated at Hartford Hospital ED and released. Coverage was confirmed 11/02/2024 with no reservation of rights. Initial reserve was set at $35,000 medical and $15,000 indemnity.",
          },
          {
            eyebrow: "Development",
            body: "Treatment extended well beyond initial expectations, including a course of epidural injections between 02/2025 and 08/2025 and a surgical consultation in 11/2025 recommending L4-L5 microdiscectomy. Reserves were increased twice, most recently on 01/12/2026 to the current $175,000 total incurred. Suit was filed 03/2025 in Hartford Superior Court.",
          },
          {
            eyebrow: "Open items at reassignment",
            body: "Three deadlines fall within five business days: expert disclosure 05/02/2026, response to plaintiff's second set of interrogatories 05/05/2026, and a status conference 05/06/2026. The IME performed 04/08/2026 by Dr. Reyes has not been returned and is required for the expert disclosure filing.",
          },
        ],
      },
    ],
    sourceDocs: [
      { name: "Claim_File_Complete.pdf", kind: "Claim File", size: "22.6MB", ext: "PDF" },
      { name: "Scheduling_Order.pdf", kind: "Legal", size: "0.3MB", ext: "PDF" },
      { name: "Medical_Chronology.pdf", kind: "Medical", size: "1.8MB", ext: "PDF" },
      { name: "Prior_Adjuster_Notes.pdf", kind: "Claim File", size: "2.1MB", ext: "PDF" },
    ],
    audit: [
      { date: "Apr 26", label: "AI briefing generated", active: true },
      { date: "Apr 26", label: "System indexed 412 pages, 18-month span" },
      { date: "Apr 26", label: "Reassignment triggered by adjuster departure" },
    ],
    completion: 88,
    groups: [
      {
        name: "Claim Identity",
        filled: 5,
        total: 5,
        fields: [
          ok("Claim Number", "CLM-7731-BI"),
          ok("Claimant", "Marcus Anderson"),
          ok("Date of Loss", "10/18/2024"),
          ok("Jurisdiction", "Hartford Superior Court, CT"),
          ok("Coverage Status", "Confirmed — no ROR"),
        ],
      },
      {
        name: "Financials",
        filled: 6,
        total: 6,
        fields: [
          ok("Medical Paid", "$31,400"),
          ok("Indemnity Paid", "$9,000"),
          ok("Expense Paid", "$6,600"),
          ok("Total Paid", "$47,000"),
          ok("Outstanding Reserve", "$128,000"),
          ok("Total Incurred", "$175,000"),
        ],
      },
      {
        name: "Critical Actions",
        filled: 2,
        total: 3,
        warnings: 1,
        fields: [
          verify("Expert Disclosure", "Due 05/02/2026", "IME report from Dr. Reyes (performed 04/08) not yet in file — required for filing"),
          ok("Interrogatory Response", "Due 05/05/2026"),
          ok("Status Conference", "05/06/2026, 9:30 AM"),
        ],
      },
    ],
  },

  "sub-4492": {
    breadcrumb: "Submission Intake",
    banner: "from-[oklch(0.40_0.13_264)] to-[oklch(0.30_0.11_270)]",
    bannerEyebrow: "In review — class code split needs confirmation",
    bannerTitle: "Workers' Comp · 47 Employees Across 4 NCCI Classes",
    bannerBody:
      "Highland HVAC Services is a Maryland-domiciled mechanical contractor seeking workers' compensation for 47 employees. The census splits cleanly across four class codes, but $214,000 of payroll sits in a dual-wage bucket that could rate at either 5183 or 5538 depending on how service versus installation hours break down.",
    confidence: 87,
    recommendationTitle: "Confirm Dual-Wage Split Before Rating",
    recommendationBody:
      "Everything else is quote-ready: experience mod pulled, four-year loss runs clean, and the account is in appetite for MD mechanical contracting. The 5183/5538 split changes indicated premium by roughly $18,000 — confirm the hours breakdown with the broker.",
    stats: [
      { label: "Employees", value: "47" },
      { label: "Total Payroll", value: "$3.1M" },
      { label: "Open Questions", value: "1", accent: true },
    ],
    keyInsights: [
      { title: "Appetite Check · In Appetite for MD Mechanical", detail: "Class 5538 within written territory, no ineligible operations", tone: "success" },
      { title: "Experience Mod · 0.89 Effective 07/01/2026", detail: "Improved from 0.97 — no lost-time claims in 3 years", tone: "primary" },
      { title: "Dual-Wage Ambiguity · $214,000 Payroll", detail: "5183 (plumbing/HVAC) vs 5538 (sheet metal) — $18K premium swing", tone: "warning" },
      { title: "Loss History · 4 Years, 2 Medical-Only", detail: "$4,100 total incurred, both closed", tone: "info" },
    ],
    narratives: [
      {
        heading: "Submission Narrative",
        sections: [
          {
            eyebrow: "Account overview",
            body: "Highland HVAC Services Inc. is a commercial mechanical contractor headquartered in Baltimore, Maryland, performing HVAC installation and service across the Baltimore–Washington corridor. The account has 47 employees and reports $3,142,000 in annual payroll. Submission is for a 07/01/2026 effective date via Northbridge Brokerage.",
          },
          {
            eyebrow: "Class code analysis",
            body: "The employee census was mapped to four NCCI codes: 5538 (sheet metal work) at $1,684,000, 5183 (plumbing and HVAC) at $908,000, 8810 (clerical) at $246,000, and 8742 (outside sales) at $90,000. A residual $214,000 is attributed to eight field technicians whose duties span both installation and service work.",
          },
          {
            eyebrow: "Why this is held",
            body: "Maryland permits dual-wage classification only where payroll records segregate hours by operation. The submitted census does not break out hours for these eight technicians. Rated entirely at 5538 the indicated premium is approximately $18,000 higher than at 5183. The broker has been asked for a segregated hours report.",
          },
        ],
      },
    ],
    sourceDocs: [
      { name: "ACORD_130_WC.pdf", kind: "Application", size: "0.7MB", ext: "PDF" },
      { name: "Employee_Census.xlsx", kind: "Supporting", size: "0.4MB", ext: "XLSX" },
      { name: "Loss_Runs_4yr.pdf", kind: "Supporting", size: "0.5MB", ext: "PDF" },
      { name: "Experience_Mod_Worksheet.pdf", kind: "Supporting", size: "0.3MB", ext: "PDF" },
    ],
    audit: [
      { date: "Apr 25", label: "AI held for class code confirmation", active: true },
      { date: "Apr 25", label: "System mapped census to 4 NCCI codes" },
      { date: "Apr 25", label: "Broker submitted via portal" },
    ],
    completion: 91,
    groups: [
      {
        name: "Account",
        filled: 6,
        total: 6,
        fields: [
          ok("Named Insured", "Highland HVAC Services Inc."),
          ok("Domicile State", "Maryland"),
          ok("FEIN", "52-1884073"),
          ok("Requested Effective", "07/01/2026"),
          ok("Producer", "Northbridge Brokerage"),
          ok("Employee Count", "47"),
        ],
      },
      {
        name: "Class Codes & Payroll",
        filled: 4,
        total: 5,
        warnings: 1,
        fields: [
          ok("5538 · Sheet Metal Work", "$1,684,000"),
          ok("5183 · Plumbing & HVAC", "$908,000"),
          ok("8810 · Clerical", "$246,000"),
          ok("8742 · Outside Sales", "$90,000"),
          verify(
            "Dual-Wage Technicians (8)",
            "$214,000 — class pending",
            "Census does not segregate install vs. service hours; 5183/5538 split changes premium by ~$18,000"
          ),
        ],
      },
      {
        name: "Rating & History",
        filled: 5,
        total: 5,
        fields: [
          ok("Experience Mod", "0.89 (eff. 07/01/2026)"),
          ok("Prior Mod", "0.97"),
          ok("Loss Runs Provided", "4 years"),
          ok("Total Incurred (4yr)", "$4,100"),
          ok("Lost-Time Claims", "0"),
        ],
      },
    ],
  },

  "sub-4503": {
    breadcrumb: "Premium Audit",
    banner: "from-[oklch(0.40_0.13_264)] to-[oklch(0.30_0.11_270)]",
    bannerEyebrow: "28% payroll variance — manual review triggered",
    bannerTitle: "Annual Audit · Variance Above Auto-Post Threshold",
    bannerBody:
      "Meridian Logistics' annual audit returned payroll 28% above the binding estimate. The variance rule auto-posts anything within 15%; beyond that an auditor confirms the driver before billing. The increase traces to a fleet expansion mid-term rather than any reclassification.",
    confidence: 90,
    recommendationTitle: "Confirm Fleet Expansion, Then Post",
    recommendationBody:
      "Payroll growth aligns with 14 drivers added between August and November 2025, which the insured disclosed at the time. Class assignments are unchanged. Confirm the headcount timeline against the 941s and the additional premium can be billed.",
    stats: [
      { label: "Additional Premium", value: "$28.4K" },
      { label: "Payroll Variance", value: "+28%" },
      { label: "Drivers Added", value: "14" },
    ],
    keyInsights: [
      { title: "Variance Driver · 14 Drivers Added Mid-Term", detail: "Hired Aug–Nov 2025; disclosed to underwriting at the time", tone: "primary" },
      { title: "Class Codes · Unchanged from Binding", detail: "7219 (trucking NOC) and 8810 (clerical) only", tone: "success" },
      { title: "Above Auto-Post Threshold · 28% vs 15%", detail: "Manual confirmation required before billing", tone: "warning" },
      { title: "941 Reconciliation · Within $2,100", detail: "Quarterly filings support the reported payroll", tone: "info" },
    ],
    narratives: [
      {
        heading: "Audit Narrative",
        sections: [
          {
            eyebrow: "Scope and period",
            body: "Annual premium audit for Meridian Logistics LLC covering 04/01/2025 through 04/01/2026. Meridian is a regional trucking operation running dedicated freight lanes across the Midwest. The audit packet included quarterly 941s, the payroll register, the driver roster with hire dates, and IFTA mileage summaries.",
          },
          {
            eyebrow: "Variance analysis",
            body: "Audited payroll of $6,412,000 against an estimated $5,010,000 — a variance of $1,402,000 or 28%. The driver roster shows headcount rising from 61 to 75 between August and November 2025 as Meridian took on two additional dedicated lanes. Payroll per driver is flat year over year, confirming the increase is headcount rather than wage inflation.",
          },
          {
            eyebrow: "Why manual review",
            body: "The straight-through audit rule posts any variance within ±15% without human confirmation. At 28% this submission exceeds that band and routes to an auditor. No reclassification or misreporting was detected — the rule is a magnitude check, not a finding of error.",
          },
        ],
      },
    ],
    sourceDocs: [
      { name: "Payroll_Register_FY25.pdf", kind: "Application", size: "2.9MB", ext: "PDF" },
      { name: "Quarterly_941s.pdf", kind: "Supporting", size: "1.0MB", ext: "PDF" },
      { name: "Driver_Roster_Hire_Dates.xlsx", kind: "Supporting", size: "0.3MB", ext: "XLSX" },
      { name: "IFTA_Mileage_Summary.pdf", kind: "Supporting", size: "0.6MB", ext: "PDF" },
    ],
    audit: [
      { date: "Apr 23", label: "AI variance check — manual review", active: true },
      { date: "Apr 23", label: "System reconciled payroll to 941s" },
      { date: "Apr 22", label: "Auditor uploaded audit packet" },
    ],
    completion: 93,
    groups: [
      {
        name: "Account & Period",
        filled: 5,
        total: 5,
        fields: [
          ok("Named Insured", "Meridian Logistics LLC"),
          ok("Policy Number", "WC-IL-660417"),
          ok("Audit Period", "04/01/2025 – 04/01/2026"),
          ok("State", "Illinois"),
          ok("Experience Mod", "1.02"),
        ],
      },
      {
        name: "Payroll & Classes",
        filled: 4,
        total: 4,
        fields: [
          ok("7219 · Trucking NOC", "$5,984,000"),
          ok("8810 · Clerical", "$428,000"),
          ok("Total Audited Payroll", "$6,412,000"),
          ok("Estimated at Binding", "$5,010,000"),
        ],
      },
      {
        name: "Variance Review",
        filled: 3,
        total: 4,
        warnings: 1,
        fields: [
          ok("Headcount at Binding", "61 drivers"),
          ok("Headcount at Audit", "75 drivers"),
          ok("Additional Premium Due", "$28,400"),
          verify(
            "Variance vs. Auto-Post Band",
            "+28% (band is ±15%)",
            "Confirm the 14 mid-term hires against 941 quarterly totals before billing"
          ),
        ],
      },
    ],
  },

  "sub-4418": {
    breadcrumb: "Submission Intake",
    banner: "from-[oklch(0.40_0.13_264)] to-[oklch(0.30_0.11_270)]",
    bannerEyebrow: "Bound and issued — no open items",
    bannerTitle: "General Liability · Quote Bound, Policy Issued",
    bannerBody:
      "Bayview Construction Group's general liability submission cleared clearance, appetite, and rating without exception. The quote was accepted on 04/18/2026 and the policy issued the same day. This record is retained for audit and needs no further action.",
    confidence: 98,
    recommendationTitle: "Complete — No Action Required",
    recommendationBody:
      "All extraction and validation steps passed. Clearance found no conflicting submission, appetite cleared on all operations, and the bound terms match the quoted terms exactly. Policy GL-WA-882041 is in force.",
    stats: [
      { label: "Bound Premium", value: "$62.8K" },
      { label: "Clearance", value: "Pass" },
      { label: "Exceptions", value: "0" },
    ],
    keyInsights: [
      { title: "Clearance · No Conflicting Submission", detail: "Checked against 24 months of prior submissions and in-force book", tone: "success" },
      { title: "Appetite · All Operations Eligible", detail: "Commercial GC, no residential or new-construction condo exposure", tone: "success" },
      { title: "Bound Terms Match Quote", detail: "Limits, deductible, and endorsements identical to quoted", tone: "primary" },
      { title: "Issued · Same Day as Acceptance", detail: "Policy GL-WA-882041 effective 05/01/2026", tone: "info" },
    ],
    narratives: [
      {
        heading: "Submission Narrative",
        sections: [
          {
            eyebrow: "Account overview",
            body: "Bayview Construction Group is a commercial general contractor operating in the Puget Sound region, performing tenant improvement and light commercial ground-up work. Annual revenue of $18,400,000 with 62 employees and a subcontractor spend of $6,200,000. Submitted for a 05/01/2026 effective date.",
          },
          {
            eyebrow: "Underwriting outcome",
            body: "Clearance ran against 24 months of prior submissions and the in-force book with no conflict. Appetite cleared: the operations schedule contains no residential work, no condominium new construction, and no work above three stories — the three exclusionary triggers for this program. Subcontractor certificates were on file for 100% of reported sub spend.",
          },
          {
            eyebrow: "Binding",
            body: "Quote issued 04/16/2026 at $62,800 for $1M/$2M occurrence and aggregate limits with a $5,000 per-occurrence deductible. Broker accepted 04/18/2026 without negotiation. Policy GL-WA-882041 issued the same day. No endorsements were added between quote and bind.",
          },
        ],
      },
    ],
    sourceDocs: [
      { name: "ACORD_125_Commercial.pdf", kind: "Application", size: "0.6MB", ext: "PDF" },
      { name: "Operations_Schedule.pdf", kind: "Application", size: "0.4MB", ext: "PDF" },
      { name: "Sub_Certificates.pdf", kind: "Supporting", size: "3.2MB", ext: "PDF" },
      { name: "Bound_Policy_GL-WA-882041.pdf", kind: "Policy", size: "1.9MB", ext: "PDF" },
    ],
    audit: [
      { date: "Apr 18", label: "Policy issued — GL-WA-882041", active: true },
      { date: "Apr 18", label: "Broker accepted quote" },
      { date: "Apr 16", label: "System issued quote at $62,800" },
    ],
    completion: 100,
    groups: [
      {
        name: "Account",
        filled: 6,
        total: 6,
        fields: [
          ok("Named Insured", "Bayview Construction Group Inc."),
          ok("State", "Washington"),
          ok("Annual Revenue", "$18,400,000"),
          ok("Employee Count", "62"),
          ok("Subcontractor Spend", "$6,200,000"),
          ok("Effective Date", "05/01/2026"),
        ],
      },
      {
        name: "Underwriting Result",
        filled: 5,
        total: 5,
        fields: [
          ok("Clearance", "Pass — no conflicting submission"),
          ok("Appetite", "In appetite — all operations eligible"),
          ok("Residential Exposure", "None reported"),
          ok("Sub Certificates on File", "100% of reported spend"),
          ok("Exceptions Raised", "0"),
        ],
      },
      {
        name: "Bound Terms",
        filled: 5,
        total: 5,
        fields: [
          ok("Policy Number", "GL-WA-882041"),
          ok("Occurrence / Aggregate", "$1,000,000 / $2,000,000"),
          ok("Deductible", "$5,000 per occurrence"),
          ok("Bound Premium", "$62,800"),
          ok("Quote-to-Bind Variance", "None"),
        ],
      },
    ],
  },

  "clm-7814": {
    breadcrumb: "Claim File Summarization",
    banner: "from-[oklch(0.38_0.10_60)] to-[oklch(0.29_0.08_52)]",
    bannerEyebrow: "Briefing delivered — reassignment accepted",
    bannerTitle: "Hail Damage · 14 Roofs Assessed, Briefing Closed",
    bannerBody:
      "Metro Housing Corp's hail claim covers 14 building roofs across a single garden-apartment complex struck on 03/02/2026. The reassignment briefing was generated, reviewed, and accepted by the receiving adjuster. Scope and reserves are settled; the file is proceeding to repair.",
    confidence: 95,
    recommendationTitle: "Complete — Briefing Accepted",
    recommendationBody:
      "The engineer's report, adjuster scope, and contractor estimate all agree on 11 roofs requiring full replacement and 3 requiring repair only. Reserves were set accordingly and the receiving adjuster accepted the file on 04/16/2026.",
    stats: [
      { label: "Total Reserve", value: "$742K" },
      { label: "Roofs Assessed", value: "14" },
      { label: "Open Actions", value: "0" },
    ],
    keyInsights: [
      { title: "Scope Agreement · Engineer, Adjuster, Contractor Align", detail: "11 full replacements, 3 repairs — no scope dispute", tone: "success" },
      { title: "Reserve Position · $742,000 Total Incurred", detail: "Dwelling $684K · ALE $38K · Expense $20K", tone: "primary" },
      { title: "Coverage · Confirmed, $25K Wind/Hail Deductible", detail: "Per-occurrence deductible applied once, not per building", tone: "info" },
      { title: "Briefing Accepted · 04/16/2026", detail: "Receiving adjuster acknowledged with no follow-up questions", tone: "success" },
    ],
    narratives: [
      {
        heading: "Claim Chronology",
        sections: [
          {
            eyebrow: "Loss event",
            body: "A severe thunderstorm produced hail up to 1.75 inches over the Metro Housing Corp garden-apartment complex in Overland Park, Kansas on 03/02/2026. The complex comprises 14 two-story buildings totaling 168 units. Loss was reported the following morning through the property manager.",
          },
          {
            eyebrow: "Investigation and scope",
            body: "A field adjuster inspected on 03/06/2026 and engaged a forensic engineer on 03/11/2026 after the insured's contractor disputed the initial scope. The engineer's report, issued 03/24/2026, found functional damage warranting full replacement on 11 of the 14 roofs and cosmetic-only damage on the remaining 3. The insured's contractor subsequently agreed to that scope.",
          },
          {
            eyebrow: "Reassignment and closure of briefing",
            body: "The file was reassigned on 04/14/2026 as part of a routine territory rebalance. The briefing summarized the scope agreement, reserve rationale, deductible application, and the single remaining vendor milestone. The receiving adjuster accepted on 04/16/2026 with no follow-up questions and repairs are proceeding.",
          },
        ],
      },
    ],
    sourceDocs: [
      { name: "Engineer_Report_Hail.pdf", kind: "Loss Evidence", size: "4.6MB", ext: "PDF" },
      { name: "Adjuster_Scope_Sheet.pdf", kind: "Claim File", size: "1.2MB", ext: "PDF" },
      { name: "Contractor_Estimate.pdf", kind: "Supporting", size: "0.9MB", ext: "PDF" },
      { name: "Roof_Inspection_Photos.zip", kind: "Loss Evidence", size: "38.2MB", ext: "ZIP" },
    ],
    audit: [
      { date: "Apr 16", label: "Briefing accepted by receiving adjuster", active: true },
      { date: "Apr 14", label: "AI briefing generated for reassignment" },
      { date: "Mar 24", label: "Engineer report received — scope agreed" },
    ],
    completion: 100,
    groups: [
      {
        name: "Claim Identity",
        filled: 5,
        total: 5,
        fields: [
          ok("Claim Number", "CLM-7814-PROP"),
          ok("Named Insured", "Metro Housing Corp"),
          ok("Date of Loss", "03/02/2026"),
          ok("Loss Location", "Overland Park, KS"),
          ok("Peril", "Hail"),
        ],
      },
      {
        name: "Scope & Damage",
        filled: 5,
        total: 5,
        fields: [
          ok("Buildings in Complex", "14"),
          ok("Roofs — Full Replacement", "11"),
          ok("Roofs — Repair Only", "3"),
          ok("Total Units Affected", "168"),
          ok("Scope Dispute Status", "Resolved — contractor agreed 03/28"),
        ],
      },
      {
        name: "Coverage & Reserves",
        filled: 6,
        total: 6,
        fields: [
          ok("Policy Number", "CP-KS-330915"),
          ok("Wind/Hail Deductible", "$25,000 per occurrence"),
          ok("Dwelling Reserve", "$684,000"),
          ok("ALE Reserve", "$38,000"),
          ok("Expense Reserve", "$20,000"),
          ok("Total Incurred", "$742,000"),
        ],
      },
    ],
  },

  "fnol-2218": {
    breadcrumb: "FNOL Claim Setup",
    banner: "from-[oklch(0.42_0.12_45)] to-[oklch(0.32_0.10_38)]",
    bannerEyebrow: "Water damage — business interruption likely",
    bannerTitle: "Commercial Kitchen Flooded by Burst Supply Line",
    bannerBody:
      "A failed braided supply line behind a dish machine flooded the kitchen and adjoining prep area of Jane Doe's restaurant overnight. The premises are closed pending remediation. No injuries. Business interruption exposure is the dominant reserve driver and depends on how long the kitchen is out.",
    confidence: 92,
    recommendationTitle: "Activate Claim and Assign to Property Adjuster",
    recommendationBody:
      "Coverage is confirmed under policy BOP-TX-449021 with water damage included and no relevant exclusion. Mitigation vendor already engaged by the insured. Assign to a property adjuster who can scope the BI period alongside the physical damage.",
    stats: [
      { label: "Initial Reserve", value: "$68K" },
      { label: "Loss Date", value: "04/19/2026" },
      { label: "BI Exposure", value: "MED", accent: true },
    ],
    keyInsights: [
      { title: "Coverage Verification · Confirmed", detail: "BOP with water damage; no maintenance or wear exclusion applies", tone: "success" },
      { title: "Initial Reserve · $68,000", detail: "Property $41K · Business interruption $22K · Expense $5K", tone: "primary" },
      { title: "Mitigation · Vendor On Site Within 6 Hours", detail: "Insured engaged Restoration Partners at 06:40 same morning", tone: "info" },
      { title: "BI Period Uncertain · 2–6 Weeks Estimated", detail: "Depends on subfloor drying and health-department reinspection", tone: "warning" },
    ],
    narratives: [
      {
        heading: "Loss Narrative",
        sections: [
          {
            eyebrow: "Reported facts",
            body: "The insured's opening manager arrived at 05:50 on 04/19/2026 to find standing water throughout the commercial kitchen and the adjoining dry-goods prep area. The source was traced to a failed braided stainless supply line feeding the dish machine, which had been running continuously overnight after the line separated at the crimp.",
          },
          {
            eyebrow: "Damage and mitigation",
            body: "Water migrated across roughly 1,400 square feet of kitchen and prep space. Affected property includes commercial flooring, lower cabinetry, two reach-in refrigeration units, and an estimated $6,000 of dry-goods inventory. The insured engaged Restoration Partners, who had extraction equipment on site by 06:40 and began structural drying the same day.",
          },
          {
            eyebrow: "Business interruption",
            body: "The restaurant is closed with no alternative kitchen capacity. Reopening requires subfloor moisture to reach acceptable levels and a health-department reinspection. Restoration Partners' preliminary estimate is 2–6 weeks depending on subfloor saturation, which is the widest single driver of reserve uncertainty on this claim.",
          },
        ],
      },
    ],
    sourceDocs: [
      { name: "FNOL_Intake_Form.pdf", kind: "Application", size: "0.7MB", ext: "PDF" },
      { name: "Mitigation_Vendor_Report.pdf", kind: "Loss Evidence", size: "1.4MB", ext: "PDF" },
      { name: "Kitchen_Damage_Photos.zip", kind: "Loss Evidence", size: "22.7MB", ext: "ZIP" },
      { name: "Policy_Declaration_BOP-TX-449021.pdf", kind: "Policy", size: "1.1MB", ext: "PDF" },
    ],
    audit: [
      { date: "Apr 19", label: "AI extraction — coverage confirmed", active: true },
      { date: "Apr 19", label: "System ingested vendor mitigation report" },
      { date: "Apr 19", label: "System received FNOL from insured portal" },
    ],
    completion: 82,
    groups: [
      {
        name: "Insured & Contact",
        filled: 5,
        total: 5,
        fields: [
          ok("Named Insured", "Jane Doe d/b/a Doe's Kitchen"),
          ok("Policy Number", "BOP-TX-449021"),
          ok("Contact Phone", "(512) 555-0197"),
          ok("Loss Location", "3140 Guadalupe St, Austin, TX 78705"),
          ok("Reported By", "Opening manager, on-site"),
        ],
      },
      {
        name: "Loss Details",
        filled: 5,
        total: 6,
        warnings: 1,
        fields: [
          ok("Date of Loss", "04/19/2026"),
          ok("Time Discovered", "05:50"),
          ok("Cause of Loss", "Burst supply line — dish machine"),
          ok("Injuries Reported", "None"),
          ok("Affected Area", "~1,400 sq ft (kitchen + prep)"),
          verify(
            "Duration of Water Flow",
            "Overnight — exact start unknown",
            "No leak sensor on premises; vendor estimating from saturation depth"
          ),
        ],
      },
      {
        name: "Damage & Reserves",
        filled: 5,
        total: 7,
        warnings: 2,
        fields: [
          ok("Flooring", "Commercial vinyl — full replacement"),
          ok("Cabinetry", "Lower runs — replacement"),
          ok("Equipment", "2 reach-in refrigeration units"),
          ok("Property Reserve", "$41,000"),
          ok("Expense Reserve", "$5,000"),
          verify(
            "Inventory Loss",
            "~$6,000 dry goods",
            "Insured estimate only — itemized inventory list not yet provided"
          ),
          verify(
            "Business Interruption Reserve",
            "$22,000 (2–6 week estimate)",
            "Range is wide pending subfloor drying results and health-department reinspection date"
          ),
        ],
      },
    ],
  },
};

Object.assign(itemDetails, additionalDetails);

/** Fallback used for item types without bespoke content authored yet. */
export function genericDetail(
  id: string,
  title: string,
  summary: string,
  type: string
): ItemDetail {
  return {
    breadcrumb: type,
    banner: "from-primary to-[oklch(0.34_0.10_190)]",
    bannerEyebrow: `${type} — AI processing complete`,
    bannerTitle: title,
    bannerBody: `${summary}. The AI Agent extracted all required fields and flagged any values that fall below the configured confidence threshold for your review.`,
    confidence: 91,
    recommendationTitle: "Approve and Push Downstream",
    recommendationBody:
      "Extraction is complete and validation rules passed. Review the flagged fields below, then submit to push results to the downstream system.",
    stats: [
      { label: "Fields", value: "24" },
      { label: "Avg Confidence", value: "91%" },
      { label: "Flags", value: "2", accent: true },
    ],
    keyInsights: [
      { title: "Extraction Complete · 24 Fields", detail: "All required fields present across source documents", tone: "success" },
      { title: "Validation Rules · Passed", detail: "No deterministic rule violations detected", tone: "primary" },
      { title: "Low Confidence · 2 Fields", detail: "Flagged below the 0.85 threshold for human review", tone: "warning" },
      { title: "Source Documents · 3 Processed", detail: "OCR completed, no unreadable pages", tone: "info" },
    ],
    narratives: [
      {
        heading: "Processing Narrative",
        sections: [
          {
            eyebrow: "Intake summary",
            body: `${summary}. Documents were received, OCR'd, and classified before field extraction ran against the ${type.toLowerCase()} schema.`,
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
      { date: "Apr 22", label: "AI extraction complete", active: true },
      { date: "Apr 22", label: "System classified and split documents" },
      { date: "Apr 22", label: "System received intake" },
    ],
    completion: 85,
    groups: [
      {
        name: "Core Identifiers",
        filled: 4,
        total: 4,
        fields: [
          ok("Reference", id.toUpperCase()),
          ok("Account Name", title.split("·")[1]?.trim() ?? title),
          ok("Received", "04/22/2026"),
          ok("Channel", "Email"),
        ],
      },
      {
        name: "Extracted Details",
        filled: 5,
        total: 6,
        warnings: 1,
        fields: [
          ok("Line of Business", "Commercial"),
          ok("Effective Date", "04/01/2026"),
          ok("Expiration Date", "04/01/2027"),
          ok("Producer", "Northbridge Brokerage"),
          ok("Territory", "NY Metro"),
          verify("Total Insured Value", "$1,240,000", "Sum across schedule differs from stated total by $4,200"),
        ],
      },
    ],
  };
}
