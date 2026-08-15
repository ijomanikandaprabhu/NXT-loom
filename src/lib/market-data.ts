import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { useOrg } from "@/lib/org-store";
import { moneyCompact as fmtCompact } from "@/data/locale";
import { placements } from "@/data/placements";
import { products } from "@/data/products";
import { flows } from "@/data/flows";
import { runs } from "@/data/runs";
import { kpisForMarket } from "@/data/work-items";
import { useItems } from "@/lib/items-store";
import { agents, workspaces, integrations, variables } from "@/data/settings-data";
import { byLine, agentPerf, headline, reviewers } from "@/data/insights-data";

/**
 * Everything visible in the app is scoped to the active market. Switching
 * market re-scopes placements, products, flows, runs, items, and analytics —
 * the same way a real tenant would only ever see one jurisdiction at a time.
 */
export function useMarketData() {
  const { market } = useI18n();
  // Resolved through the org store so admin-created markets carry their own
  // currency and regulator. The seed lookup fell back to Singapore for them,
  // which quietly relabelled every figure on the page.
  const { markets, marketFor } = useOrg();
  // Read through the store so a review decision moves the list and the KPIs
  // together — numbers that disagree with the rows below them read as a bug.
  const { items: allItems } = useItems();
  const info = marketFor(market) ?? markets[0];

  return useMemo(() => {

    const scopedPlacements = placements.filter((p) => p.market === market);
    const scopedProducts = products.filter((p) => p.markets.includes(market));
    const scopedFlows = flows.filter((f) => !f.markets || f.markets.includes(market));
    const scopedRuns = runs.filter((r) => r.market === market);
    const scopedItems = allItems.filter((i) => i.market === market);

    // Lines of business actually sold in this market drive the analytics split.
    const linesHere = new Set(scopedProducts.map((p) => p.line));
    const scopedByLine = byLine.filter((l) => linesHere.has(l.line as never));

    // Agents are workspace-scoped; Takaful agents only surface in MY/ID.
    const scopedAgents = info.takaful
      ? agents
      : agents.filter((a) => !/takaful/i.test(a.name));

    const itemKpis = kpisForMarket(scopedItems);

    // Placement KPIs derived from the scoped book, so they match the list.
    const open = scopedPlacements.filter((p) => p.stage !== "Bound" && p.stage !== "Lost");
    const bound = scopedPlacements.filter((p) => p.stage === "Bound").length;
    const inMarket = open.reduce(
      (sum, p) => sum + p.quotes.reduce((s, q) => s + (q.premium ?? 0), 0),
      0
    );
    const awaiting = scopedPlacements.reduce(
      (n, p) => n + p.quotes.filter((q) => q.status === "Pending").length,
      0
    );
    const placementKpis = [
      { n: String(open.length), l: "Open placements", tone: "primary" as const },
      { n: inMarket ? fmtCompact(inMarket, info.currency) : "—", l: "Premium in market", tone: "info" as const },
      {
        n: scopedPlacements.length
          ? `${Math.round((bound / scopedPlacements.length) * 100)}%`
          : "—",
        l: "Quote-to-bind rate",
        tone: "success" as const,
      },
      { n: String(awaiting), l: "Awaiting carrier", tone: "warning" as const },
      { n: scopedPlacements.length ? "3.4d" : "—", l: "Median quote turnaround", tone: "info" as const },
    ];

    // Run KPIs are derived from the scoped runs, so they never contradict the list.
    const ok = scopedRuns.filter((r) => r.status === "Succeeded").length;
    const failed = scopedRuns.filter((r) => r.status === "Failed").length;
    const waiting = scopedRuns.filter((r) => r.status === "Awaiting review").length;
    const completion = scopedRuns.length
      ? ((ok / scopedRuns.length) * 100).toFixed(1)
      : "0.0";
    const runKpis = [
      { n: String(scopedRuns.length), l: "Runs, last 24h", tone: "primary" as const },
      { n: `${completion}%`, l: "Completion rate", tone: "success" as const },
      { n: String(waiting), l: "Awaiting review", tone: "warning" as const },
      { n: String(failed), l: "Failed, last 24h", tone: "danger" as const },
      { n: scopedRuns.length ? "41s" : "—", l: "Median duration", tone: "info" as const },
    ];

    // Headline metrics shift per market — SEA maturity is genuinely uneven.
    const maturity: Record<string, number> = {
      SG: 1.0,
      MY: 0.96,
      TH: 0.9,
      PH: 0.87,
      VN: 0.84,
      ID: 0.82,
    };
    const f = maturity[market] ?? 0.8;
    const scopedHeadline = headline.map((m, i) => {
      if (i === 0) return { ...m, value: `${(87.4 * f).toFixed(1)}%` };
      if (i === 1) return { ...m, value: `${(98.1 * (0.965 + f * 0.035)).toFixed(1)}%` };
      return m;
    });

    const scopedAgentPerf = agentPerf.map((a) => ({
      ...a,
      runs: Math.round(a.runs * f),
      stp: Number((a.stp * f).toFixed(1)),
      accuracy: Number((a.accuracy * (0.97 + f * 0.03)).toFixed(1)),
    }));

    return {
      market,
      info,
      placements: scopedPlacements,
      products: scopedProducts,
      flows: scopedFlows,
      runs: scopedRuns,
      items: scopedItems,
      itemKpis,
      runKpis,
      placementKpis,
      agents: scopedAgents,
      workspaces,
      integrations,
      variables,
      byLine: scopedByLine,
      headline: scopedHeadline,
      agentPerf: scopedAgentPerf,
      reviewers,
    };
  }, [market, info, allItems]);
}
