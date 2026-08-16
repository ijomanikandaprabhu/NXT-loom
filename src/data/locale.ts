/**
 * Market and currency access for this app.
 *
 * The definitions themselves live in `@technxt/contracts`, because every
 * product needs the same answer about what a market is, where its data may be
 * stored, and how its currency is written. This module is the app's view of
 * them — re-exported so existing imports keep working, plus the one behaviour
 * that is local to this app.
 */

export {
  money,
  moneyCompact,
  currencyRules,
  markets,
  nameFormatByMarket,
} from "@technxt/contracts";

export type {
  SeedCurrencyCode,
  CurrencyCode,
  CurrencyRule,
  SeedMarketCode,
  MarketCode,
  Market,
  Residency,
  NameFormat,
} from "@technxt/contracts";

import { markets, marketByCode as lookup, type MarketCode, type Market } from "@technxt/contracts";

/**
 * Falls back to the first seeded market rather than returning undefined.
 *
 * That is an app decision, not a contract one: a screen needs something to
 * render, whereas a service handling an unknown market should fail rather than
 * quietly answer about Singapore. The contract's own lookup returns undefined
 * for exactly that reason.
 */
export const marketByCode = (c: MarketCode): Market => lookup(c) ?? markets[0];
