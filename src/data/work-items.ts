export type WorkItemType =
  | "INDEXING"
  | "ROLLOVER"
  | "ENDORSE"
  | "AUDIT"
  | "SUBMISSION"
  | "FNOL"
  | "CLAIM SUMMARY";

export type WorkItemStatus = "Requires Review" | "In Review" | "Completed";

export type WorkItem = {
  id: string;
  itemId: string;
  type: WorkItemType;
  title: string;
  summary: string;
  status: WorkItemStatus;
  reviewer: string;
};

export const typeColors: Record<WorkItemType, string> = {
  INDEXING: "bg-info",
  ROLLOVER: "bg-success",
  ENDORSE: "bg-destructive",
  AUDIT: "bg-primary",
  SUBMISSION: "bg-accent-foreground",
  FNOL: "bg-warning",
  "CLAIM SUMMARY": "bg-muted-foreground",
};

export const workItems: WorkItem[] = [
  {
    id: "ci-8801",
    itemId: "88012",
    type: "INDEXING",
    title: "CI-8801 · Smith v. Stoltz Trucking — Inbound Demand Package",
    summary: "6 components classified · 1 low-confidence flag · CLM-2024-118827",
    status: "Requires Review",
    reviewer: "Priya Raman",
  },
  {
    id: "rol-7100",
    itemId: "71240",
    type: "ROLLOVER",
    title: "ROL-7100 · Pinewood HVAC — Stated vs AcrossCountry Rollover",
    summary: "Stated non-renewal · 287-page policy · 3 critical gaps surfaced",
    status: "Requires Review",
    reviewer: "Marcus Reilly",
  },
  {
    id: "end-3204",
    itemId: "52840",
    type: "ENDORSE",
    title: "END-3204 · Cascade Pacific Energy Cooperative",
    summary: "CA-OR-748291-25 · Fleet Schedule Endorsement · Eff 04/01/2026",
    status: "Requires Review",
    reviewer: "James Park",
  },
  {
    id: "pa-5501",
    itemId: "47102",
    type: "AUDIT",
    title: "PA-5501 · Peachtree Foundations LLC — WC Premium Audit",
    summary: "Annual audit · GA concrete class · 1 required document missing",
    status: "Requires Review",
    reviewer: "Sarah Chen",
  },
  {
    id: "sub-4471",
    itemId: "45765",
    type: "SUBMISSION",
    title: "SUB-4471 · Kings County Property Management LLC",
    summary: "CP + GL submission for 3 Brooklyn/Queens properties, $1.2M TIV",
    status: "In Review",
    reviewer: "Sarah Chen",
  },
  {
    id: "fnol-2231",
    itemId: "34593",
    type: "FNOL",
    title: "FNOL-2231 · Oakwood Enterprises — Commercial Auto BI",
    summary: "Three-vehicle collision at Intersect 5th & Broadway — claimant on duty driver",
    status: "Requires Review",
    reviewer: "James Morales",
  },
  {
    id: "clm-7731",
    itemId: "78921",
    type: "CLAIM SUMMARY",
    title: "CLM-7731 · Marcus Anderson BI — Reassignment",
    summary: "18-month BI claim reassigned — $47K paid, 3 critical actions in next 5 days",
    status: "Requires Review",
    reviewer: "Jennifer Park",
  },
  {
    id: "sub-4492",
    itemId: "45802",
    type: "SUBMISSION",
    title: "SUB-4492 · Highland HVAC Services Inc.",
    summary: "Workers' Comp — 47 employees, 4 NCCI classes, Maryland domicile",
    status: "In Review",
    reviewer: "Livia Franci",
  },
  {
    id: "clm-7814",
    itemId: "78954",
    type: "CLAIM SUMMARY",
    title: "CLM-7814 · Metro Housing Corp — Hail Damage",
    summary: "Roof damage assessment from hail storm — adjuster reassignment briefing",
    status: "Completed",
    reviewer: "Marie Doe",
  },
  {
    id: "fnol-2218",
    itemId: "34587",
    type: "FNOL",
    title: "FNOL-2218 · Jane Doe — Water Damage",
    summary: "Water damage from burst pipe in commercial kitchen",
    status: "Requires Review",
    reviewer: "John Smith",
  },
  {
    id: "sub-4503",
    itemId: "45821",
    type: "SUBMISSION",
    title: "SUB-4503 · Meridian Logistics LLC — Premium Audit",
    summary: "Annual premium audit — 28% payroll variance triggers manual review",
    status: "Requires Review",
    reviewer: "Ellen Tarca",
  },
  {
    id: "sub-4418",
    itemId: "45740",
    type: "SUBMISSION",
    title: "SUB-4418 · Bayview Construction Group",
    summary: "General Liability — quote bound and issued, clearance passed",
    status: "Completed",
    reviewer: "Ellen Tarca",
  },
];
