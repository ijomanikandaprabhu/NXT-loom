/**
 * Currency formatting for Southeast Asia.
 *
 * Shared rather than reimplemented because getting it wrong is silent: a naive
 * `toLocaleString` renders IDR and VND with minor units and the wrong thousands
 * separator, and the result still looks like money. Two products formatting the
 * same premium differently is a support ticket nobody can reproduce.
 */

export type SeedCurrencyCode = "SGD" | "MYR" | "IDR" | "THB" | "VND" | "PHP";
/** Widened so a market created at runtime can carry its own currency. */
export type CurrencyCode = SeedCurrencyCode | (string & {});

export type CurrencyRule = {
  symbol: string;
  /** IDR and VND have no minor unit in practice. */
  decimals: 0 | 2;
  /** Bahasa and Vietnamese use "." for thousands and "," for decimals. */
  group: "," | ".";
  decimal: "." | ",";
  /** VND writes the symbol after the amount. */
  suffix?: boolean;
};

export const currencyRules: Record<string, CurrencyRule> = {
  SGD: { symbol: "S$", decimals: 2, group: ",", decimal: "." },
  MYR: { symbol: "RM", decimals: 2, group: ",", decimal: "." },
  IDR: { symbol: "Rp", decimals: 0, group: ".", decimal: "," },
  THB: { symbol: "฿", decimals: 2, group: ",", decimal: "." },
  VND: { symbol: "₫", decimals: 0, group: ".", decimal: ",", suffix: true },
  PHP: { symbol: "₱", decimals: 2, group: ",", decimal: "." },
};

const fallback = (currency: CurrencyCode): CurrencyRule => ({
  symbol: `${currency} `,
  decimals: 2,
  group: ",",
  decimal: ".",
});

export function money(amount: number, currency: CurrencyCode): string {
  const r = currencyRules[currency] ?? fallback(currency);
  const fixed = amount.toFixed(r.decimals);
  const [whole, frac] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, r.group);
  const body = frac ? `${grouped}${r.decimal}${frac}` : grouped;
  return r.suffix ? `${body}${r.symbol}` : `${r.symbol}${body}`;
}

/** Compact form for dashboards — Rp45,0 M · 2,5 tỷ₫ · S$1.2M */
export function moneyCompact(amount: number, currency: CurrencyCode): string {
  const r = currencyRules[currency] ?? fallback(currency);

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
