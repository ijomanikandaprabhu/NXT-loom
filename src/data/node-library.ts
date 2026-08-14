export type LibraryNode = {
  name: string;
  desc: string;
  disabled?: boolean;
};

export type LibraryGroup = {
  group: string;
  dot: string;
  nodes: LibraryNode[];
};

export const nodeLibrary: LibraryGroup[] = [
  {
    group: "Triggers",
    dot: "bg-warning",
    nodes: [
      { name: "Manual File Upload", desc: "Manual File Upload" },
      { name: "Outlook Trigger", desc: "Outlook Trigger" },
      { name: "HTTP Trigger", desc: "HTTP Trigger (Webhook)", disabled: true },
      { name: "Schedule", desc: "Recurring Schedule or Timer", disabled: true },
      { name: "SFTP Trigger", desc: "SFTP Trigger", disabled: true },
    ],
  },
  {
    group: "Utilities",
    dot: "bg-info",
    nodes: [
      { name: "Custom Code", desc: "Custom Code Blocks" },
      { name: "Field Validation", desc: "Field Validation" },
      { name: "HTTP", desc: "API Request" },
      { name: "HTTP File Upload", desc: "HTTP File Upload" },
      { name: "Review", desc: "Flag for Human Review" },
    ],
  },
  {
    group: "Apps",
    dot: "bg-primary",
    nodes: [
      { name: "Create Claim", desc: "Create a Guidewire Claim" },
      { name: "Search Claim", desc: "Search for a Guidewire Claim" },
      { name: "Update Claim", desc: "Update a Guidewire Claim" },
      { name: "Download Email", desc: "Download Outlook Email" },
      { name: "Mark Email Read", desc: "Mark Outlook Email as Read" },
      { name: "Move Email", desc: "Move Outlook Email" },
      { name: "Move Email to Folder", desc: "Move Outlook Email to Folder" },
    ],
  },
  {
    group: "Actions",
    dot: "bg-destructive",
    nodes: [{ name: "Mark Item as Complete", desc: "Mark Item as Complete" }],
  },
  {
    group: "Controls",
    dot: "bg-muted-foreground",
    nodes: [
      { name: "If", desc: "Conditional Branching" },
      { name: "Switch", desc: "Multiple Condition Branches" },
      { name: "For Loop", desc: "Iterate over a collection" },
      { name: "Sleep", desc: "Pause Flow Execution" },
    ],
  },
  {
    group: "NXT Extract",
    dot: "bg-primary",
    nodes: [
      { name: "Insights", desc: "Insights" },
      { name: "NXT Extract: Custom", desc: "NXT Extract: Custom" },
    ],
  },
];

export type FlowRun = {
  label: string;
  when: string;
  status: "Completed" | "Cancelled" | "Failed";
  duration: string;
  latest?: boolean;
};

export const recentRuns: FlowRun[] = [
  { label: "Run #2", when: "Apr 25, 10:14 AM", status: "Completed", duration: "2m 13s", latest: true },
  { label: "Run #1", when: "Apr 25, 09:47 AM", status: "Completed", duration: "2m 14s" },
  { label: "Run", when: "Apr 24, 04:12 PM", status: "Cancelled", duration: "38s" },
];
