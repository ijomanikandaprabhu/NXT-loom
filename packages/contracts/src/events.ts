/**
 * The events products exchange.
 *
 * With seven separate builds, this file is the integration. Direct calls
 * between products would be twenty-one pairs to version; a published event has
 * one publisher and any number of subscribers, so an eighth product adds one
 * connection rather than seven.
 *
 * Two rules the types enforce as far as types can. Every fact has exactly one
 * publisher — two products emitting `policy.issued` forces every subscriber to
 * guess which to believe. And every hop is asynchronous: the loop from lead to
 * policy to claim to payment to commission is circular, and circular
 * synchronous dependencies deadlock.
 */

import type { MarketCode } from "./markets";
import type { CurrencyCode } from "./money";

export type EventName =
  | "lead.converted"
  | "quote.requested"
  | "policy.issued"
  | "claim.notified"
  | "claim.decided"
  | "payment.collected"
  | "renewal.due";

/** The single system allowed to publish each fact. */
export const publisherOf: Record<EventName, string> = {
  "lead.converted": "any-channel",
  "quote.requested": "any-channel",
  "policy.issued": "brokerverse",
  "claim.notified": "any-channel",
  "claim.decided": "nxt-loom",
  "payment.collected": "brokerverse",
  "renewal.due": "brokerverse",
};

type Envelope<N extends EventName, P> = {
  name: N;
  /** Deduplication key — delivery is at-least-once, so consumers must be idempotent. */
  id: string;
  occurredAt: string;
  orgId: string;
  market: MarketCode;
  /** Which product emitted it, for the audit trail. */
  source: string;
  payload: P;
};

export type Money = { amount: number; currency: CurrencyCode };

export type LeadConverted = Envelope<"lead.converted", {
  customerId: string;
  channel: string;
}>;

export type QuoteRequested = Envelope<"quote.requested", {
  customerId: string;
  productId: string;
  channel: string;
}>;

export type PolicyIssued = Envelope<"policy.issued", {
  policyId: string;
  customerId: string;
  productId: string;
  premium: Money;
  inceptionDate: string;
}>;

export type ClaimNotified = Envelope<"claim.notified", {
  claimId: string;
  policyId: string;
  lossDate: string;
  channel: string;
}>;

export type ClaimDecided = Envelope<"claim.decided", {
  claimId: string;
  policyId: string;
  outcome: "approved" | "rejected";
  settlement?: Money;
  /**
   * The run that produced the decision. Carried so the ledger entry can point
   * back at the trace — a posting whose reasoning cannot be retrieved is the
   * thing a regulator objects to.
   */
  runId: string;
  decidedBy: { principalId: string; name: string } | { automated: true };
}>;

export type PaymentCollected = Envelope<"payment.collected", {
  policyId: string;
  amount: Money;
  /** Commission pays on collected, never booked — see the platform plan. */
  commission?: Money;
}>;

export type RenewalDue = Envelope<"renewal.due", {
  policyId: string;
  customerId: string;
  dueDate: string;
}>;

export type PlatformEvent =
  | LeadConverted
  | QuoteRequested
  | PolicyIssued
  | ClaimNotified
  | ClaimDecided
  | PaymentCollected
  | RenewalDue;

/**
 * A claim decision does not write to the ledger; it asks. Two systems able to
 * post financial entries is how an audit finding is produced, so the ledger
 * stays the single writer and this is the shape of the request.
 */
export type PostingRequest = {
  requestId: string;
  orgId: string;
  market: MarketCode;
  policyId: string;
  claimId: string;
  amount: Money;
  /** Same id twice must post once. */
  idempotencyKey: string;
  runId: string;
};
