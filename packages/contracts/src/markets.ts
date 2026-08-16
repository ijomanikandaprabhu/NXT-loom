/**
 * Markets, and the regulatory facts attached to them.
 *
 * Residency is the field that matters most: Indonesia and Vietnam compel
 * personal data to remain in-country, which constrains where a product may be
 * deployed at all. Every product needs the same answer to that question, so it
 * is stated once here rather than per application.
 */

import type { CurrencyCode } from "./money";

/** The six seeded markets. Admin-created markets widen this to any string. */
export type SeedMarketCode = "SG" | "MY" | "ID" | "TH" | "VN" | "PH";
export type MarketCode = SeedMarketCode | (string & {});

export type Residency =
  /** Personal data must remain in-country — Indonesia, Vietnam. */
  | "required"
  /** In-region preferred, not compelled. */
  | "preferred"
  /** No restriction. */
  | "open";

export type Market = {
  code: MarketCode;
  name: string;
  flag: string;
  currency: CurrencyCode;
  regulator: string;
  regulatorName: string;
  languages: string[];
  residency: Residency;
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

/** Falls back rather than throwing: a runtime market may not be seeded. */
export const marketByCode = (c: MarketCode): Market | undefined =>
  markets.find((m) => m.code === c);

/**
 * Name handling across the region.
 *
 * Indonesian and Javanese names are frequently mononyms, and Vietnamese order
 * is family-name-first. A required surname field rejects legitimate applicants
 * in both cases, which is a data-capture bug that reads as discrimination.
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
