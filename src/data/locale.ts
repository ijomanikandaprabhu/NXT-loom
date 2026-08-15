/** The six seeded markets. Admin-created markets widen this to any string. */
export type SeedMarketCode = "SG" | "MY" | "ID" | "TH" | "VN" | "PH";
export type MarketCode = SeedMarketCode | (string & {});
export type SeedCurrencyCode = "SGD" | "MYR" | "IDR" | "THB" | "VND" | "PHP";
export type CurrencyCode = SeedCurrencyCode | (string & {});

export type Market = {
  code: MarketCode;
  name: string;
  flag: string;
  currency: CurrencyCode;
  regulator: string;
  regulatorName: string;
  languages: string[];
  /** Personal data must stay in-country. */
  residency: "required" | "preferred" | "open";
  takaful: boolean;
  dataLaw: string;
};

export const markets: Market[] = [
  {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    currency: "SGD",
    regulator: "MAS",
    regulatorName: "Monetary Authority of Singapore",
    languages: ["English"],
    residency: "open",
    takaful: false,
    dataLaw: "PDPA 2012",
  },
  {
    code: "MY",
    name: "Malaysia",
    flag: "🇲🇾",
    currency: "MYR",
    regulator: "BNM",
    regulatorName: "Bank Negara Malaysia",
    languages: ["English", "Bahasa Malaysia"],
    residency: "preferred",
    takaful: true,
    dataLaw: "PDPA 2010",
  },
  {
    code: "ID",
    name: "Indonesia",
    flag: "🇮🇩",
    currency: "IDR",
    regulator: "OJK",
    regulatorName: "Otoritas Jasa Keuangan",
    languages: ["Bahasa Indonesia"],
    residency: "required",
    takaful: true,
    dataLaw: "PDP Law 27/2022 · PP 71/2019",
  },
  {
    code: "TH",
    name: "Thailand",
    flag: "🇹🇭",
    currency: "THB",
    regulator: "OIC",
    regulatorName: "Office of Insurance Commission",
    languages: ["Thai", "English"],
    residency: "preferred",
    takaful: false,
    dataLaw: "PDPA 2019",
  },
  {
    code: "VN",
    name: "Vietnam",
    flag: "🇻🇳",
    currency: "VND",
    regulator: "MOF-ISA",
    regulatorName: "Insurance Supervisory Authority",
    languages: ["Vietnamese"],
    residency: "required",
    takaful: false,
    dataLaw: "Decree 13/2023",
  },
  {
    code: "PH",
    name: "Philippines",
    flag: "🇵🇭",
    currency: "PHP",
    regulator: "IC",
    regulatorName: "Insurance Commission",
    languages: ["English", "Filipino"],
    residency: "preferred",
    takaful: false,
    dataLaw: "Data Privacy Act 2012",
  },
];

type CurrencyRule = {
  symbol: string;
  /** IDR and VND are quoted without minor units. */
  decimals: 0 | 2;
  /** Bahasa/Vietnamese use "." for thousands and "," for decimals. */
  group: "," | ".";
  decimal: "." | ",";
  /** Symbol placement. */
  suffix?: boolean;
};

const rules: Record<string, CurrencyRule> = {
  SGD: { symbol: "S$", decimals: 2, group: ",", decimal: "." },
  MYR: { symbol: "RM", decimals: 2, group: ",", decimal: "." },
  IDR: { symbol: "Rp", decimals: 0, group: ".", decimal: "," },
  THB: { symbol: "฿", decimals: 2, group: ",", decimal: "." },
  VND: { symbol: "₫", decimals: 0, group: ".", decimal: ",", suffix: true },
  PHP: { symbol: "₱", decimals: 2, group: ",", decimal: "." },
};

/**
 * Formats money per SEA market convention.
 * IDR/VND drop minor units entirely and use "." as the thousands separator —
 * a naive toLocaleString produces wrong output for both.
 */
export function money(amount: number, currency: CurrencyCode): string {
  const r = rules[currency] ?? { symbol: `${currency} `, decimals: 2, group: ",", decimal: "." };
  const fixed = amount.toFixed(r.decimals);
  const [whole, frac] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, r.group);
  const body = frac ? `${grouped}${r.decimal}${frac}` : grouped;
  return r.suffix ? `${body}${r.symbol}` : `${r.symbol}${body}`;
}

/** Compact form for dashboards — Rp 45,0 jt / ₫2,5 tỷ / S$1.2M */
export function moneyCompact(amount: number, currency: CurrencyCode): string {
  const r = rules[currency] ?? { symbol: `${currency} `, decimals: 2, group: ",", decimal: "." };
  if (currency === "IDR") {
    if (amount >= 1e9) return `Rp${(amount / 1e9).toFixed(1).replace(".", ",")} M`;
    if (amount >= 1e6) return `Rp${(amount / 1e6).toFixed(1).replace(".", ",")} jt`;
    return money(amount, currency);
  }
  if (currency === "VND") {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1).replace(".", ",")} tỷ${r.symbol}`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1).replace(".", ",")} tr${r.symbol}`;
    return money(amount, currency);
  }
  if (amount >= 1e6) return `${r.symbol}${(amount / 1e6).toFixed(1)}M`;
  if (amount >= 1e3) return `${r.symbol}${(amount / 1e3).toFixed(0)}K`;
  return money(amount, currency);
}

export const marketByCode = (c: MarketCode) => markets.find((m) => m.code === c) ?? markets[0];

/**
 * SEA name handling. Indonesian and Javanese names are frequently mononyms,
 * and Vietnamese order is family-name-first — a required surname field
 * rejects legitimate applicants in both cases.
 */
export type NameFormat = "western" | "mononym-ok" | "family-first";

export const nameFormatByMarket: Record<string, NameFormat> = {
  SG: "western",
  MY: "mononym-ok",
  ID: "mononym-ok",
  TH: "western",
  VN: "family-first",
  PH: "western",
};
