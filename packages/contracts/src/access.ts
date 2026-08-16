/**
 * The access model, shared across every product.
 *
 * Each product signs in on its own — separate domain, separate session, with
 * federation to the customer's identity provider where they want continuity.
 * What must not diverge is the *vocabulary*: two products with different ideas
 * of what "oversight" means, or whether a market grant is a wildcard, cannot
 * exchange an audit trail that anyone would accept.
 */

import type { MarketCode } from "./markets";

/**
 * Six bases plus grants, rather than fixed role bundles. Fourteen hard-coded
 * roles becomes sixty the first time a customer asks for a variant.
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

/** Capabilities that change state. Oversight roles are refused all of them. */
export const writeCapabilities: ReadonlySet<Capability> = new Set<Capability>([
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

export type TenantKind = "insurer" | "brokerage" | "mga";

export type Principal = {
  id: string;
  orgId: string;
  name: string;
  base: BaseRole;
  capabilities: Capability[];
  /**
   * Absence of a market is absence of access — there is no wildcard. Under
   * Indonesia's PDP Law and Vietnam's Decree 13, a cross-border read is a legal
   * question rather than a preference, so this is checked server-side on every
   * request rather than filtered in a interface.
   */
  markets: MarketCode[];
  /** Reads everything, changes nothing — so an audit trail cannot be curated. */
  readOnly?: boolean;
  /**
   * Set when the principal is outside the tenant. Whether a broker is internal
   * or external depends on who the tenant is — staff inside a brokerage, an
   * outside party seen from an insurer — so it is stated per principal rather
   * than inferred from the role.
   */
  external?: { firm: string; handle: string };
};

export function can(p: Principal, capability: Capability): boolean {
  if (p.readOnly && writeCapabilities.has(capability)) return false;
  return p.capabilities.includes(capability);
}

export function maySeeMarket(p: Principal, market: MarketCode): boolean {
  return p.markets.includes(market);
}

/**
 * Separation of duties, expressed once so no product has to remember it.
 * These are the three that regulators ask about directly.
 */
export const separationOfDuties = [
  { rule: "Nobody who posts a ledger entry may approve it", pair: ["ledger.post", "ledger.approve"] },
  { rule: "Nobody who builds a flow may publish it alone", pair: ["flow.edit", "flow.publish"] },
] as const satisfies ReadonlyArray<{ rule: string; pair: readonly [Capability, Capability] }>;

/** True when a single principal holds both halves of a duty that must be split. */
export function violatesSeparation(p: Principal): string[] {
  return separationOfDuties
    .filter(({ pair }) => pair.every((c) => p.capabilities.includes(c)))
    .map(({ rule }) => rule);
}
