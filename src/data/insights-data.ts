export type Metric = {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  hint: string;
};

export const headline: Metric[] = [
  { label: "Straight-through processing", value: "87.4%", delta: "4.2pt", up: true, hint: "Items completed with no human touch" },
  { label: "Field extraction accuracy", value: "98.1%", delta: "0.6pt", up: true, hint: "Measured against the gold corpus" },
  { label: "Median turnaround", value: "6m 12s", delta: "1m 40s", up: true, hint: "Intake to downstream write" },
  { label: "Cost per completed item", value: "$0.41", delta: "$0.07", up: true, hint: "OCR + inference + integration" },
];

/** Straight-through processing rate over the last 14 days. */
export const stpSeries = [78, 79, 81, 80, 83, 82, 84, 85, 84, 86, 87, 86, 88, 87.4];

export type LinePerf = {
  line: "P&C" | "Health" | "Life";
  items: number;
  stp: number;
  accuracy: number;
  review: number;
};

export const byLine: LinePerf[] = [
  { line: "P&C", items: 12840, stp: 89.2, accuracy: 98.4, review: 1_390 },
  { line: "Health", items: 8412, stp: 86.1, accuracy: 97.6, review: 1_168 },
  { line: "Life", items: 3106, stp: 81.7, accuracy: 97.9, review: 568 },
];

export type AgentPerf = {
  agent: string;
  workspace: string;
  runs: number;
  stp: number;
  accuracy: number;
  drift: number;
};

export const agentPerf: AgentPerf[] = [
  { agent: "FNOL/FROI", workspace: "Claims", runs: 4820, stp: 91.4, accuracy: 98.7, drift: -0.2 },
  { agent: "Indexing & Summarization", workspace: "Claims", runs: 6110, stp: 94.2, accuracy: 98.9, drift: 0.1 },
  { agent: "Submission Intake", workspace: "Underwriting", runs: 3940, stp: 84.6, accuracy: 97.8, drift: -0.9 },
  { agent: "Risk Triage", workspace: "Underwriting", runs: 2180, stp: 79.1, accuracy: 96.9, drift: -1.6 },
  { agent: "Endorsement Processing", workspace: "Policy Servicing", runs: 2760, stp: 92.8, accuracy: 98.5, drift: 0.3 },
  { agent: "Premium Audit", workspace: "Policy Servicing", runs: 1180, stp: 71.3, accuracy: 96.2, drift: -0.4 },
];

export type Reviewer = { name: string; closed: number; avgTime: string; overrideRate: number };

export const reviewers: Reviewer[] = [
  { name: "Maria Garcia", closed: 142, avgTime: "3m 04s", overrideRate: 11.2 },
  { name: "Liam Park", closed: 128, avgTime: "3m 41s", overrideRate: 9.8 },
  { name: "Priya Patel", closed: 119, avgTime: "2m 52s", overrideRate: 14.1 },
  { name: "James Morales", closed: 104, avgTime: "4m 18s", overrideRate: 8.4 },
  { name: "Ellen Tarca", closed: 97, avgTime: "3m 22s", overrideRate: 12.6 },
];

/** Confidence calibration — are 90%-confidence predictions right 90% of the time? */
export const calibration = [
  { bucket: "50–60%", predicted: 55, actual: 58 },
  { bucket: "60–70%", predicted: 65, actual: 66 },
  { bucket: "70–80%", predicted: 75, actual: 73 },
  { bucket: "80–90%", predicted: 85, actual: 86 },
  { bucket: "90–95%", predicted: 92, actual: 91 },
  { bucket: "95–100%", predicted: 98, actual: 97 },
];
