import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  markets as builtInMarkets,
  type Market,
  type MarketCode,
} from "@/data/locale";

/** A market added by an admin at runtime. Shape matches the built-ins plus its own currency rule. */
export type CustomMarket = Market & {
  custom: true;
  currencySymbol: string;
  currencyDecimals: 0 | 2;
  currencyGroup: "," | ".";
  currencyDecimalMark: "." | ",";
  currencySuffix: boolean;
};

export type AnyMarket = Market | CustomMarket;

export type BranchType = "Head office" | "Branch" | "Agency" | "Partner";
export type BranchStatus = "Active" | "Setup" | "Suspended";

export type Branch = {
  id: string;
  name: string;
  code: string;
  /** The country this branch reports into. */
  marketCode: string;
  city: string;
  type: BranchType;
  status: BranchStatus;
  manager: string;
  createdAt: string;
};

const seedBranches: Branch[] = [
  { id: "br-1", name: "Singapore Head Office", code: "SG-HQ", marketCode: "SG", city: "Singapore", type: "Head office", status: "Active", manager: "Keiko Tanaka", createdAt: "12/01/2025" },
  { id: "br-2", name: "Kuala Lumpur Branch", code: "MY-KL", marketCode: "MY", city: "Kuala Lumpur", type: "Branch", status: "Active", manager: "Rosa Haddad", createdAt: "02/14/2026" },
  { id: "br-3", name: "Johor Bahru Agency", code: "MY-JB", marketCode: "MY", city: "Johor Bahru", type: "Agency", status: "Active", manager: "Umar Macarilay", createdAt: "03/02/2026" },
  { id: "br-4", name: "Jakarta Head Office", code: "ID-JKT", marketCode: "ID", city: "Jakarta", type: "Head office", status: "Active", manager: "Priya Becker", createdAt: "01/20/2026" },
  { id: "br-5", name: "Surabaya Branch", code: "ID-SBY", marketCode: "ID", city: "Surabaya", type: "Branch", status: "Active", manager: "Umar Macarilay", createdAt: "04/08/2026" },
  { id: "br-6", name: "Bangkok Branch", code: "TH-BKK", marketCode: "TH", city: "Bangkok", type: "Branch", status: "Active", manager: "Wei Larsson", createdAt: "03/18/2026" },
  { id: "br-7", name: "Ho Chi Minh City Branch", code: "VN-HCM", marketCode: "VN", city: "Ho Chi Minh City", type: "Branch", status: "Setup", manager: "Livia Franci", createdAt: "05/30/2026" },
  { id: "br-8", name: "Manila Branch", code: "PH-MNL", marketCode: "PH", city: "Manila", type: "Branch", status: "Active", manager: "Ellen Tarca", createdAt: "02/28/2026" },
];

type OrgValue = {
  /** Built-in plus admin-created markets. */
  markets: AnyMarket[];
  customMarkets: CustomMarket[];
  branches: Branch[];
  addMarket: (m: CustomMarket) => void;
  removeMarket: (code: string) => void;
  addBranch: (b: Omit<Branch, "id" | "createdAt">) => void;
  removeBranch: (id: string) => void;
  branchesFor: (code: string) => Branch[];
  marketFor: (code: string) => AnyMarket | undefined;
  /** Formats money for any market, including admin-created currencies. */
  money: (amount: number, marketCode: string) => string;
};

const OrgContext = createContext<OrgValue | null>(null);

const STORE_MARKETS = "nxtloom.customMarkets";
const STORE_BRANCHES = "nxtloom.branches";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [customMarkets, setCustomMarkets] = useState<CustomMarket[]>(() =>
    load<CustomMarket[]>(STORE_MARKETS, [])
  );
  const [branches, setBranches] = useState<Branch[]>(() =>
    load<Branch[]>(STORE_BRANCHES, seedBranches)
  );

  useEffect(() => {
    localStorage.setItem(STORE_MARKETS, JSON.stringify(customMarkets));
  }, [customMarkets]);

  useEffect(() => {
    localStorage.setItem(STORE_BRANCHES, JSON.stringify(branches));
  }, [branches]);

  const value = useMemo<OrgValue>(() => {
    const all: AnyMarket[] = [...builtInMarkets, ...customMarkets];
    const marketFor = (code: string) => all.find((m) => m.code === code);

    return {
      markets: all,
      customMarkets,
      branches,
      marketFor,
      branchesFor: (code) => branches.filter((b) => b.marketCode === code),
      addMarket: (m) => setCustomMarkets((prev) => [...prev, m]),
      removeMarket: (code) => {
        setCustomMarkets((prev) => prev.filter((m) => m.code !== code));
        // Branches cannot outlive the country they report into.
        setBranches((prev) => prev.filter((b) => b.marketCode !== code));
      },
      addBranch: (b) =>
        setBranches((prev) => [
          ...prev,
          {
            ...b,
            id: `br-${Date.now().toString(36)}`,
            createdAt: new Date().toLocaleDateString("en-GB"),
          },
        ]),
      removeBranch: (id) => setBranches((prev) => prev.filter((b) => b.id !== id)),
      money: (amount, code) => {
        const m = marketFor(code);
        if (!m) return String(amount);
        const c = m as CustomMarket;
        const isCustom = "custom" in m && m.custom;
        const decimals = isCustom ? c.currencyDecimals : builtInDecimals(m.currency);
        const group = isCustom ? c.currencyGroup : builtInGroup(m.currency);
        const dec = isCustom ? c.currencyDecimalMark : builtInDecimal(m.currency);
        const symbol = isCustom ? c.currencySymbol : builtInSymbol(m.currency);
        const suffix = isCustom ? c.currencySuffix : m.currency === "VND";

        const fixed = amount.toFixed(decimals);
        const [whole, frac] = fixed.split(".");
        const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
        const body = frac ? `${grouped}${dec}${frac}` : grouped;
        return suffix ? `${body}${symbol}` : `${symbol}${body}`;
      },
    };
  }, [customMarkets, branches]);

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg(): OrgValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside <OrgProvider>");
  return ctx;
}

/* Built-in currency rules, mirrored from locale.ts so custom markets can extend them. */
const builtIn: Record<string, { s: string; d: 0 | 2; g: "," | "."; dm: "." | "," }> = {
  SGD: { s: "S$", d: 2, g: ",", dm: "." },
  MYR: { s: "RM", d: 2, g: ",", dm: "." },
  IDR: { s: "Rp", d: 0, g: ".", dm: "," },
  THB: { s: "฿", d: 2, g: ",", dm: "." },
  VND: { s: "₫", d: 0, g: ".", dm: "," },
  PHP: { s: "₱", d: 2, g: ",", dm: "." },
};
const builtInSymbol = (c: string) => builtIn[c]?.s ?? c + " ";
const builtInDecimals = (c: string) => builtIn[c]?.d ?? 2;
const builtInGroup = (c: string) => builtIn[c]?.g ?? ",";
const builtInDecimal = (c: string) => builtIn[c]?.dm ?? ".";

/** Codes already taken, so the admin form can reject duplicates. */
export function isCodeTaken(markets: AnyMarket[], code: string) {
  return markets.some((m) => m.code.toUpperCase() === code.toUpperCase());
}

export type { MarketCode };
