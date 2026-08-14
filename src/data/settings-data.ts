export type Workspace = {
  name: string;
  id: string;
  org: string;
  agents: number;
};

export const workspaces: Workspace[] = [
  { name: "Claims", id: "019c04d0-dbc4-75d8-946f-7d0tc0e7145d", org: "NXT Loom Demo Org", agents: 3 },
  { name: "Underwriting", id: "019cd4bc-07c9-76ec-88e2-a277ae37cd8b", org: "NXT Loom Demo Org", agents: 4 },
  { name: "Policy Servicing", id: "019c04bd-3a91-7a02-9d1c-6b2e0f7741aa", org: "NXT Loom Demo Org", agents: 3 },
  { name: "Test Workspace", id: "00000000-4d6c-41aa-a157-93ed533e4230", org: "NXT Loom Demo Org", agents: 4 },
];

export type Agent = {
  name: string;
  id: string;
  workspace: string;
  users: number;
  created: string;
  time: string;
};

export const agents: Agent[] = [
  { name: "FNOL/FROI", id: "019cd4be-3998-76df-8ebb-ab87ed956140", workspace: "Claims", users: 17, created: "3/10/2026", time: "12:06 AM" },
  { name: "Indexing & Summarization", id: "019cd4be-1204-777e-890c-f89c43632c1a", workspace: "Claims", users: 17, created: "3/10/2026", time: "12:05 AM" },
  { name: "Resolution", id: "019cd4c0-2124-77df-a9dd-e0f5bb6a7a6f", workspace: "Claims", users: 17, created: "3/10/2026", time: "12:08 AM" },
  { name: "Submission Intake", id: "019cd4c1-5510-7a11-9c2e-1aa2b3c4d5e6", workspace: "Underwriting", users: 23, created: "2/10/2026", time: "9:32 PM" },
  { name: "Risk Triage", id: "019cd4c2-66a1-7b22-8d3f-2bb3c4d5e6f7", workspace: "Underwriting", users: 19, created: "2/11/2026", time: "4:54 PM" },
  { name: "Appetite Check", id: "019cd4c3-77b2-7c33-9e40-3cc4d5e6f708", workspace: "Underwriting", users: 12, created: "2/12/2026", time: "3:18 PM" },
  { name: "Quote Preparation", id: "019cd4c4-88c3-7d44-af51-4dd5e6f70819", workspace: "Underwriting", users: 14, created: "2/13/2026", time: "6:47 PM" },
  { name: "Endorsement Processing", id: "019cd4c5-99d4-7e55-b062-5ee6f708192a", workspace: "Policy Servicing", users: 9, created: "2/20/2026", time: "4:00 PM" },
  { name: "Certificate Issuance", id: "019cd4c6-aae5-7f66-c173-6ff70819203b", workspace: "Policy Servicing", users: 8, created: "2/21/2026", time: "9:25 PM" },
  { name: "Renewal Prep", id: "019cd4c7-bbf6-7077-d284-70081920314c", workspace: "Policy Servicing", users: 11, created: "2/22/2026", time: "1:42 PM" },
  { name: "Sandbox Extraction", id: "00000000-1111-7a88-e395-810819203a5d", workspace: "Test Workspace", users: 3, created: "11/5/2024", time: "5:30 PM" },
  { name: "Sandbox Classifier", id: "00000000-2222-7b99-f4a6-920819203b6e", workspace: "Test Workspace", users: 2, created: "11/6/2024", time: "5:30 PM" },
  { name: "Sandbox Router", id: "00000000-3333-7caa-05b7-a30819203c7f", workspace: "Test Workspace", users: 2, created: "11/7/2024", time: "5:30 PM" },
  { name: "Sandbox Summarizer", id: "00000000-4444-7dbb-16c8-b40819203d80", workspace: "Test Workspace", users: 4, created: "11/8/2024", time: "5:30 PM" },
];

export type UserStatus = "Active" | "Invited" | "Disabled";
export type User = {
  name: string;
  email: string;
  status: UserStatus;
  roles: string[];
  agents: number;
  joined: string;
};

const firstNames = [
  "Sarah Chen", "Andrii Betcher", "Antonio Park", "Ashwin Ivanova", "Ben Reyes",
  "Benedick Cartera", "Bernie Kim", "Bill Murphy", "Carlos Costa", "Diana Venkat",
  "Elena Rossi", "Farah Patel", "Grace Dubois", "Hassan Andrieiev", "Ingrid Okafor",
  "Jamal Silva", "Keiko Tanaka", "Liam Walsh", "Maria Galve", "Noah Nguyen",
  "Olivia Schmidt", "Priya Becker", "Quentin Elliott", "Rosa Haddad", "Sven Garcia",
  "Tara Owusu", "Umar Macarilay", "Vera Novak", "Wei Larsson", "Yuki Khan",
];

const seedRoles: string[][] = [
  ["PLATFORM_ADMIN"], ["ADMIN"], ["ADMIN"], ["ADMIN"], ["PARTNER"],
  ["PARTNER"], ["DEPOT", "REVIEWER"], ["ALERT"], ["REVIEWER"], ["REVIEWER"],
  ["REVIEWER"], ["REVIEWER"], ["REVIEWER"], ["REVIEWER"], ["REVIEWER"],
  ["REVIEWER"], ["REVIEWER"], ["REVIEWER"], ["REVIEWER"], ["REVIEWER"],
  ["PLATFORM_ADMIN"], ["ADMIN"], ["ADMIN"], ["ADMIN"], ["PARTNER", "REVIEWER"],
  ["PARTNER"], ["DEPOT"], ["ALERT"], ["REVIEWER"], ["REVIEWER"],
];

const seedStatus: UserStatus[] = [
  "Active", "Active", "Active", "Active", "Active",
  "Active", "Active", "Active", "Active", "Active",
  "Active", "Active", "Active", "Active", "Active",
  "Active", "Active", "Invited", "Invited", "Disabled",
  "Active", "Active", "Active", "Active", "Active",
  "Active", "Active", "Active", "Active", "Active",
];

const seedAgentCounts = [1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 3, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 12, 1, 1, 2, 1, 1, 1, 1];

function slug(name: string) {
  return name.toLowerCase().replace(/\s+/g, ".");
}

function dateFor(i: number) {
  const start = new Date(2024, 0, 1);
  start.setDate(start.getDate() + i * 6);
  return `${start.getMonth() + 1}/${start.getDate()}/${start.getFullYear()}`;
}

export const users: User[] = Array.from({ length: 110 }, (_, i) => {
  const base = i % 30;
  const cycle = Math.floor(i / 30);
  const name = firstNames[base];
  return {
    name,
    email: `${slug(name)}${i >= 30 ? i : ""}@nxtloom.ai`,
    status: cycle === 0 ? seedStatus[base] : i % 17 === 3 ? "Invited" : i % 23 === 9 ? "Disabled" : "Active",
    roles: cycle === 0 ? seedRoles[base] : i % 20 === 10 ? ["PLATFORM_ADMIN"] : i % 20 === 11 ? ["ADMIN"] : ["REVIEWER"],
    agents: cycle === 0 ? seedAgentCounts[base] : i % 13 === 5 ? 4 : i % 19 === 9 ? 12 : i % 11 === 0 ? 3 : 1,
    joined: dateFor(i),
  };
});

export type Role = {
  name: string;
  id: string;
  type: string;
  users: number;
  permissions: number;
  created: string;
  time: string;
};

export const roles: Role[] = [
  { name: "PLATFORM_ADMIN", id: "00000000-21be-44c4-81d4-a05a51cb235f", type: "Global", users: 6, permissions: 87, created: "5/24/2025", time: "3:02 AM" },
  { name: "REVIEWER", id: "019dd0ba-db31-7348-a645-ef5ae850175a", type: "Global", users: 69, permissions: 33, created: "4/27/2026", time: "10:26 PM" },
  { name: "PARTNER", id: "019e4731-6f1a-74e8-a019-bf9e9318d67f", type: "Global", users: 12, permissions: 62, created: "5/20/2026", time: "10:31 PM" },
  { name: "DEPOT", id: "00000000-64e9-4834-a9e7-db06bc141549", type: "Org: NXT Loom Demo Org", users: 6, permissions: 2, created: "2/15/2025", time: "10:57 PM" },
  { name: "ALERT", id: "00000000-a6c5-472a-97d4-a02746e5676b", type: "Org: NXT Loom Demo Org", users: 6, permissions: 7, created: "2/23/2025", time: "12:00 PM" },
  { name: "ADMIN", id: "00000000-9de5-4250-9323-b3ae6abbffbd", type: "Global", users: 18, permissions: 80, created: "10/14/2024", time: "7:38 AM" },
];

export type ApiKey = {
  prefix: string;
  created: string;
  createdTime: string;
  expires: string;
  expiresTime?: string;
};

export const apiKeys: ApiKey[] = [
  { prefix: "pAyZmTrw", created: "5/29/2026", createdTime: "5:53 PM", expires: "11/25/2026", expiresTime: "5:53 PM" },
  { prefix: "z0gEdd9i", created: "5/29/2026", createdTime: "5:52 PM", expires: "11/25/2026", expiresTime: "5:52 PM" },
  { prefix: "cKvUE5jy", created: "5/26/2026", createdTime: "9:20 PM", expires: "11/22/2026", expiresTime: "9:20 PM" },
  { prefix: "gDpSHda1", created: "5/23/2026", createdTime: "8:25 PM", expires: "11/19/2026", expiresTime: "8:25 PM" },
  { prefix: "Ulrz_B_N", created: "5/5/2026", createdTime: "6:24 PM", expires: "11/1/2026", expiresTime: "6:24 PM" },
  { prefix: "hswxn9vd", created: "5/5/2026", createdTime: "2:04 PM", expires: "3/31/2027", expiresTime: "12:30 PM" },
  { prefix: "jI9LbsIr", created: "4/20/2026", createdTime: "3:41 PM", expires: "3/31/2027", expiresTime: "12:30 PM" },
  { prefix: "MzKj_F15", created: "4/2/2026", createdTime: "10:38 PM", expires: "Never" },
  { prefix: "Qw7Tp2Lx", created: "3/15/2026", createdTime: "3:11 PM", expires: "Never" },
];

export type Environment = {
  name: string;
  id: string;
  variables: number;
  description: string;
  created: string;
  time: string;
};

export const environments: Environment[] = [
  { name: "prod", id: "019be6fa-ef5d-7664-a97b-bd885d8408c9", variables: 8, description: "-", created: "1/22/2026", time: "7:02 PM" },
  { name: "staging", id: "019c7247-8395-7154-b8ca-c6c339b57b7b", variables: 5, description: "-", created: "2/18/2026", time: "8:13 PM" },
];

export type Integration = {
  name: string;
  category: "Core system" | "Email" | "CRM" | "File transfer" | "Alerting" | "Custom";
  status: "Connected" | "Degraded" | "Not connected";
  detail: string;
  environments: string[];
  lastCheck: string;
};

export const integrations: Integration[] = [
  { name: "Guidewire ClaimCenter", category: "Core system", status: "Connected", detail: "Claim create, search, and update", environments: ["prod", "staging"], lastCheck: "2 min ago" },
  { name: "Guidewire PolicyCenter", category: "Core system", status: "Connected", detail: "Policy lookup and endorsement posting", environments: ["prod"], lastCheck: "2 min ago" },
  { name: "Duck Creek", category: "Core system", status: "Not connected", detail: "Policy administration", environments: [], lastCheck: "—" },
  { name: "Microsoft Outlook", category: "Email", status: "Connected", detail: "6 monitored inboxes across 3 workspaces", environments: ["prod", "staging"], lastCheck: "40 sec ago" },
  { name: "Salesforce", category: "CRM", status: "Degraded", detail: "API rate limit hit twice in the last hour", environments: ["prod"], lastCheck: "6 min ago" },
  { name: "SFTP — Broker Drop", category: "File transfer", status: "Connected", detail: "Nightly loss-run and census pickup", environments: ["prod"], lastCheck: "1 hr ago" },
  { name: "Microsoft Teams", category: "Alerting", status: "Connected", detail: "Exception and failure alerts", environments: ["prod", "staging"], lastCheck: "5 min ago" },
  { name: "Custom HTTP", category: "Custom", status: "Connected", detail: "4 configured endpoints", environments: ["prod", "staging"], lastCheck: "3 min ago" },
];

export type VarScope = "Environment" | "Workspace" | "AI Agent" | "Flow" | "Global" | "Local";
export type Variable = {
  name: string;
  ref: string;
  scope: VarScope;
  version: number;
  created: string;
  createdTime: string;
  updated: string;
  updatedTime: string;
  env: "prod" | "staging";
};

export const variables: Variable[] = [
  { name: "SMTP_API_KEY", ref: "var-p1", scope: "Environment", version: 2, created: "1/22/2026", createdTime: "7:10 PM", updated: "3/2/2026", updatedTime: "3:48 PM", env: "prod" },
  { name: "S3_BUCKET_NAME", ref: "var-p2", scope: "Global", version: 1, created: "1/22/2026", createdTime: "7:11 PM", updated: "1/22/2026", updatedTime: "7:11 PM", env: "prod" },
  { name: "WEBHOOK_SIGNING_SECRET", ref: "var-p3", scope: "Environment", version: 1, created: "1/23/2026", createdTime: "2:32 PM", updated: "1/23/2026", updatedTime: "2:32 PM", env: "prod" },
  { name: "DB_CONNECTION_STRING", ref: "var-p4", scope: "Environment", version: 3, created: "1/24/2026", createdTime: "4:45 PM", updated: "4/11/2026", updatedTime: "10:14 PM", env: "prod" },
  { name: "REDIS_URL", ref: "var-p5", scope: "Workspace", version: 1, created: "2/1/2026", createdTime: "8:00 PM", updated: "2/1/2026", updatedTime: "8:00 PM", env: "prod" },
  { name: "SENTRY_DSN", ref: "var-p6", scope: "Global", version: 1, created: "2/3/2026", createdTime: "1:52 PM", updated: "2/3/2026", updatedTime: "1:52 PM", env: "prod" },
  { name: "OCR_SERVICE_TOKEN", ref: "var-p7", scope: "AI Agent", version: 2, created: "2/9/2026", createdTime: "6:41 PM", updated: "3/19/2026", updatedTime: "5:35 PM", env: "prod" },
  { name: "FEATURE_FLAGS_KEY", ref: "var-p8", scope: "Flow", version: 1, created: "2/12/2026", createdTime: "9:18 PM", updated: "2/12/2026", updatedTime: "9:18 PM", env: "prod" },
  { name: "SMTP_API_KEY", ref: "var-s1", scope: "Environment", version: 1, created: "2/18/2026", createdTime: "8:20 PM", updated: "2/18/2026", updatedTime: "8:20 PM", env: "staging" },
  { name: "S3_BUCKET_NAME", ref: "var-s2", scope: "Global", version: 1, created: "2/18/2026", createdTime: "8:21 PM", updated: "2/18/2026", updatedTime: "8:21 PM", env: "staging" },
  { name: "DB_CONNECTION_STRING", ref: "var-s3", scope: "Environment", version: 2, created: "2/19/2026", createdTime: "10:05 AM", updated: "3/8/2026", updatedTime: "2:11 PM", env: "staging" },
  { name: "OCR_SERVICE_TOKEN", ref: "var-s4", scope: "AI Agent", version: 1, created: "2/20/2026", createdTime: "1:30 PM", updated: "2/20/2026", updatedTime: "1:30 PM", env: "staging" },
  { name: "SANDBOX_SEED", ref: "var-s5", scope: "Local", version: 1, created: "2/22/2026", createdTime: "4:02 PM", updated: "2/22/2026", updatedTime: "4:02 PM", env: "staging" },
];
