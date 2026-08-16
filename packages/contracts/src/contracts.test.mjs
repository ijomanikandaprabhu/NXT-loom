/**
 * Tests for the rules that must not drift between products.
 *
 * Run with `node --experimental-strip-types src/contracts.test.mjs` from the
 * package, or `npm test -w @technxt/contracts`.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { money, moneyCompact } from "./money.ts";
import { markets, marketByCode, nameFormatByMarket } from "./markets.ts";
import { can, maySeeMarket, violatesSeparation } from "./access.ts";
import { publisherOf } from "./events.ts";

test("IDR drops minor units and groups on a full stop", () => {
  assert.equal(money(32_000_000_000, "IDR"), "Rp32.000.000.000");
  assert.equal(money(612_000_000, "IDR"), "Rp612.000.000");
});

test("VND drops minor units and puts the symbol last", () => {
  assert.equal(money(50_000_000, "VND"), "50.000.000₫");
});

test("SGD and MYR keep two decimals with comma grouping", () => {
  assert.equal(money(18_400, "SGD"), "S$18,400.00");
  assert.equal(money(3_180, "MYR"), "RM3,180.00");
});

test("an unknown currency degrades to a prefixed code rather than throwing", () => {
  assert.equal(money(1_500, "KHR"), "KHR 1,500.00");
});

test("compact form uses the local scale word", () => {
  assert.equal(moneyCompact(48_000_000_000, "IDR"), "Rp48,0 M");
  assert.equal(moneyCompact(45_000_000, "IDR"), "Rp45,0 jt");
  assert.equal(moneyCompact(2_500_000_000, "VND"), "2,5 tỷ₫");
  assert.equal(moneyCompact(1_200_000, "SGD"), "S$1.2M");
});

test("Indonesia and Vietnam require in-country data", () => {
  assert.equal(marketByCode("ID").residency, "required");
  assert.equal(marketByCode("VN").residency, "required");
  assert.equal(marketByCode("SG").residency, "open");
});

test("Takaful applies in Malaysia and Indonesia only", () => {
  const takaful = markets.filter((m) => m.takaful).map((m) => m.code).sort();
  assert.deepEqual(takaful, ["ID", "MY"]);
});

test("an unseeded market returns undefined rather than a wrong answer", () => {
  assert.equal(marketByCode("KH"), undefined);
});

test("mononyms are accepted where they are common", () => {
  assert.equal(nameFormatByMarket.ID, "mononym-ok");
  assert.equal(nameFormatByMarket.MY, "mononym-ok");
  assert.equal(nameFormatByMarket.VN, "family-first");
});

const oversight = {
  id: "u1", orgId: "o1", name: "Compliance", base: "oversight",
  capabilities: ["audit.read", "item.review"], markets: ["SG"], readOnly: true,
};

test("a read-only principal is refused every write capability", () => {
  assert.equal(can(oversight, "audit.read"), true);
  assert.equal(can(oversight, "item.review"), false);
});

test("market scope has no wildcard", () => {
  assert.equal(maySeeMarket(oversight, "SG"), true);
  assert.equal(maySeeMarket(oversight, "ID"), false);
});

test("holding both halves of a split duty is reported", () => {
  const both = { ...oversight, readOnly: false, capabilities: ["ledger.post", "ledger.approve"] };
  assert.equal(violatesSeparation(both).length, 1);
  assert.equal(violatesSeparation(oversight).length, 0);
});

test("every event names exactly one publisher", () => {
  const names = Object.keys(publisherOf);
  assert.equal(names.length, 7);
  assert.ok(names.every((n) => typeof publisherOf[n] === "string" && publisherOf[n].length > 0));
  assert.equal(publisherOf["policy.issued"], "brokerverse");
  assert.equal(publisherOf["claim.decided"], "nxt-loom");
});
