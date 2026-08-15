import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { MarketCode } from "@/data/locale";

/**
 * Access model — six base roles plus capability grants.
 *
 * Fourteen fixed roles becomes sixty the moment customers ask for variants, so
 * a role is a base plus a set of grants rather than a hard-coded bundle. Market
 * scope is carried on the user, not on the product: under Indonesia's PDP Law
 * and Vietnam's Decree 13 a manager in one country viewing another country's
 * claimant data can be a legal violation, not a preference.
 *
 * In a real deployment every check below is server-side and the scope rides in
 * the token. Here it is client-side because there is no server yet — enough to
 * demonstrate the model, not enough to enforce it.
 */

export type BaseRole = "producer" | "servicer" | "finance" | "builder" | "oversight" | "admin";

export type Capability =
  | "item.review"
  | "item.override"
  | "placement.bind"
  | "flow.edit"
  | "flow.publish"
  | "product.edit"
  | "ledger.post"
  | "ledger.approve"
  | "run.manage"
  | "audit.read"
  | "admin.org";

export type User = {
  id: string;
  name: string;
  initials: string;
  title: string;
  base: BaseRole;
  /** Markets this user may see at all. The switcher offers nothing else. */
  markets: MarketCode[];
  branch?: string;
  capabilities: Capability[];
  /** Bind authority in the user's own market currency. Undefined means none. */
  bindAuthority?: number;
  /** Oversight roles read everything and write nothing, by design. */
  readOnly?: boolean;
};

/** Routes a base role can reach. Assistant is always available. */
const navByRole: Record<BaseRole, string[]> = {
  producer:  ["/placements", "/products"],
  servicer:  ["/items", "/runs", "/insights"],
  finance:   ["/placements", "/insights"],
  builder:   ["/flows", "/products", "/runs", "/items"],
  oversight: ["/runs", "/items", "/insights", "/settings"],
  admin:     ["/products", "/flows", "/placements", "/runs", "/items", "/insights", "/settings"],
};

export const demoUsers: User[] = [
  {
    id: "u_processor",
    name: "Aisyah Rahman",
    initials: "AR",
    title: "Claims Processor",
    base: "servicer",
    markets: ["MY"],
    branch: "Kuala Lumpur",
    capabilities: ["item.review"],
  },
  {
    id: "u_underwriter",
    name: "Nguyen Van Minh",
    initials: "NM",
    title: "Underwriter",
    base: "servicer",
    markets: ["VN"],
    branch: "Ho Chi Minh City",
    capabilities: ["item.review", "item.override", "placement.bind"],
    bindAuthority: 500_000_000,
  },
  {
    id: "u_opsmanager",
    name: "Sarah Chen",
    initials: "SC",
    title: "Operations Manager",
    base: "servicer",
    markets: ["SG", "MY"],
    capabilities: ["item.review", "run.manage"],
  },
  {
    id: "u_engineer",
    name: "Rizky Pratama",
    initials: "RP",
    title: "Automation Engineer",
    base: "builder",
    markets: ["ID", "MY", "SG"],
    capabilities: ["flow.edit", "run.manage"],
  },
  {
    id: "u_compliance",
    name: "Somchai Wattana",
    initials: "SW",
    title: "Compliance Officer",
    base: "oversight",
    markets: ["SG", "MY", "ID", "TH", "VN", "PH"],
    capabilities: ["audit.read"],
    readOnly: true,
  },
  {
    id: "u_admin",
    name: "Priya Kumar",
    initials: "PK",
    title: "Org Administrator",
    base: "admin",
    markets: ["SG", "MY", "ID", "TH", "VN", "PH"],
    capabilities: ["admin.org", "product.edit", "flow.edit"],
  },
];

const STORE_SESSION = "nxtloom.session";

type AuthValue = {
  user: User | null;
  signIn: (userId: string) => void;
  signOut: () => void;
  /** Capability check. Read-only users are refused every write capability. */
  can: (cap: Capability) => boolean;
  /** Routes the signed-in user may reach. */
  allowedRoutes: string[];
  /** Markets the signed-in user may see. */
  allowedMarkets: MarketCode[];
};

const AuthContext = createContext<AuthValue | null>(null);

const writeCaps = new Set<Capability>([
  "item.review",
  "item.override",
  "placement.bind",
  "flow.edit",
  "flow.publish",
  "product.edit",
  "ledger.post",
  "ledger.approve",
  "run.manage",
  "admin.org",
]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORE_SESSION);
    return demoUsers.find((u) => u.id === saved) ?? null;
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORE_SESSION, user.id);
    else localStorage.removeItem(STORE_SESSION);
  }, [user]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      signIn: (id) => setUser(demoUsers.find((u) => u.id === id) ?? null),
      signOut: () => setUser(null),
      can: (cap) => {
        if (!user) return false;
        // Oversight can read everything and change nothing — so the audit trail
        // can never be curated by the person being audited.
        if (user.readOnly && writeCaps.has(cap)) return false;
        return user.capabilities.includes(cap);
      },
      allowedRoutes: user ? navByRole[user.base] : [],
      allowedMarkets: user?.markets ?? [],
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** True when the signed-in role may read but not change anything. */
export function useReadOnly() {
  return useAuth().user?.readOnly ?? false;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
