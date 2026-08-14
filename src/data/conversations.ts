export type Conversation = {
  id: string;
  title: string;
  question: string;
  answer: string;
  /** "ops" answers from run/review data; "knowledge" answers from policy wordings and guidelines. */
  mode?: "ops" | "knowledge";
  sources?: string[];
};

export const conversations: Conversation[] = [
  {
    id: "claims-backlog",
    title: "Claims backlog summary",
    question: "Give me a summary of the current claims backlog.",
    answer:
      "The Claims workspace has **38 open items**: 14 in *Requires Review*, 19 *In Progress*, and 5 *System Exception*. Average age is **5h 41m**; the FNOL/FROI agent is handling 92% straight-through this week.",
  },
  {
    id: "underwriting-sla",
    title: "Underwriting SLA check",
    question: "Are any underwriting submissions breaching SLA?",
    answer:
      "No SLA breaches right now. 2 submissions are within an hour of their 4-hour target — both are waiting on a reviewer in the Underwriting workspace.",
  },
  {
    id: "require-review",
    title: "Require-Review breakdown",
    question: "Break down everything in Requires Review by type.",
    answer:
      "51 items in *Requires Review*: 23 Submissions, 14 Claims, 9 Endorsements, 5 Premium Audits. The oldest has waited 2h 14m.",
  },
  {
    id: "failed-overnight",
    title: "Which flows failed overnight?",
    question: "Did any flows fail overnight?",
    answer:
      "No failed flow runs in the last 12 hours. One run on *Renewal Prep* retried once and then succeeded.",
  },
  {
    id: "top-reviewers",
    title: "Top reviewers by throughput",
    question: "Who are the top reviewers this week?",
    answer:
      "This week: Maria Garcia (142 items), Liam Park (128), and Priya Patel (119) lead on completed reviews.",
  },
  {
    id: "maternity-waiting",
    title: "Group Medical maternity waiting period",
    mode: "knowledge",
    question: "What's the maternity waiting period on Group Medical, and does it apply to a transferring member?",
    answer:
      "Group Medical carries a **12-month maternity waiting period** on the Worldwide plans; the Regional — Asia Pacific plan has no maternity benefit at all.\n\nFor a member transferring from another group scheme, the waiting period is **waived** where continuous prior cover of 12 months or more is evidenced — see *Continuity of Cover*, section 4.3. Break in cover of more than 31 days resets the clock.",
    sources: ["Group_Medical_Wording_v4.2.pdf · §4.3, §7.1", "Underwriting_Guidelines_Health.pdf · p.22"],
  },
  {
    id: "gvwr-binding",
    title: "Commercial Auto GVWR bind authority",
    mode: "knowledge",
    question: "Can I bind a 40,000 lb unit on Commercial Auto without referral?",
    answer:
      "No. The straight-through bind ceiling on Commercial Auto is **33,000 lb GVWR**. A 40,000 lb unit exceeds that and must route to the specialty auto desk.\n\nThe other three auto-bind conditions are: model year within 10 years, garaging radius inside the rated territory, and an assigned driver with a clean 36-month MVR. All four must pass — failing any one forces referral.",
    sources: ["Commercial_Auto_Rules_v3.4.pdf · §2.1", "Bind_Authority_Matrix.xlsx · row 14"],
  },
];
