import type { WorkItem } from "@/data/work-items";
import type { Run } from "@/data/runs";
import type { Product } from "@/data/products";
import type { Placement } from "@/data/placements";
import type { Reviewer } from "@/data/insights-data";

/**
 * Question answering over the active market's data.
 *
 * Pattern matching, not a language model — every figure it returns is read from
 * the same source the screens render, so an answer can never contradict the page
 * the user checks next. That property matters more here than fluency: an
 * assistant that quotes a backlog of nine beside a list showing seven destroys
 * trust in both.
 *
 * Answers say where the number came from and link to the screen that proves it.
 */

export type AnswerRow = {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
};

export type CopilotAnswer = {
  /** Supports **strong** and *emphasis*, matching the existing renderer. */
  text: string;
  rows?: AnswerRow[];
  link?: { to: string; label: string };
  sources?: string[];
};

export type CopilotContext = {
  marketName: string;
  marketFlag: string;
  currency: string;
  regulator: string;
  takaful: boolean;
  userName: string;
  userTitle: string;
  items: WorkItem[];
  runs: Run[];
  products: Product[];
  placements: Placement[];
  reviewers: Reviewer[];
  flowCount: number;
};

type Intent = {
  id: string;
  /** Any one match is enough; ordered most specific first. */
  test: RegExp[];
  answer: (c: CopilotContext) => CopilotAnswer;
};

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "—");
/** Agreement helpers — a count of one reads badly with a plural verb, and these
 *  strings are the most-read output in the product. */
const plural = (n: number, word: string) => (n === 1 ? word : `${word}s`);
const verb = (n: number, one: string, many: string) => (n === 1 ? one : many);

const intents: Intent[] = [
  {
    id: "assigned-to-me",
    test: [/assigned to me/i, /\bmy (items|queue|work)\b/i, /what.*(should|do) i (work|do)/i],
    answer: (c) => {
      const mine = c.items.filter((i) => i.reviewer === c.userName);
      const open = mine.filter((i) => i.status !== "Completed");
      if (mine.length === 0) {
        return {
          text: `Nothing in ${c.marketFlag} **${c.marketName}** is assigned to you right now. Items land here when you claim them from the review queue, or when a flow routes one to you directly.`,
          link: { to: "/items", label: "Open the queue" },
        };
      }
      return {
        text: `You have **${open.length} open** of ${mine.length} assigned in ${c.marketFlag} **${c.marketName}**.`,
        rows: open.slice(0, 5).map((i) => ({
          label: i.title.split("·")[0].trim(),
          value: i.status,
          tone: i.status === "Requires Review" ? ("warning" as const) : ("default" as const),
        })),
        link: { to: "/items", label: "Open my queue" },
        sources: ["work_items.market_scoped"],
      };
    },
  },
  {
    id: "requires-review",
    test: [/requires? review/i, /awaiting review/i, /need(s|ing)? (a )?review/i, /backlog/i, /pending items/i],
    answer: (c) => {
      const requires = c.items.filter((i) => i.status === "Requires Review");
      const inReview = c.items.filter((i) => i.status === "In Review");
      if (c.items.length === 0) {
        return {
          text: `There are no work items in ${c.marketFlag} **${c.marketName}** at all. This market is scoped to ${c.regulator} and ${c.currency} — switch market from the button in the bottom-left corner to see items elsewhere.`,
        };
      }
      return {
        text: `**${requires.length}** ${plural(requires.length, "item")} ${verb(requires.length, "requires", "require")} review in ${c.marketFlag} **${c.marketName}**, and ${inReview.length} ${verb(inReview.length, "is", "are")} already in progress. That is *${pct(requires.length, c.items.length)}* of the market's ${c.items.length} items.`,
        rows: requires.slice(0, 5).map((i) => ({
          label: i.title.split("·")[0].trim(),
          value: i.type,
        })),
        link: { to: "/items", label: "Review these items" },
        sources: ["work_items.market_scoped"],
      };
    },
  },
  {
    id: "processed",
    test: [/processed/i, /completed/i, /finished/i, /closed (items|today|yesterday)/i, /how many.*done/i],
    answer: (c) => {
      const done = c.items.filter((i) => i.status === "Completed");
      return {
        text: `**${done.length}** of ${c.items.length} items are complete in ${c.marketFlag} **${c.marketName}** — *${pct(done.length, c.items.length)}* of the market's volume.`,
        rows: [
          { label: "Completed", value: String(done.length), tone: "success" },
          { label: "In review", value: String(c.items.filter((i) => i.status === "In Review").length) },
          { label: "Requires review", value: String(c.items.filter((i) => i.status === "Requires Review").length), tone: "warning" },
        ],
        link: { to: "/items", label: "Open Items" },
        sources: ["work_items.market_scoped"],
      };
    },
  },
  {
    id: "failed-runs",
    // Bare "fail" matters as much as its inflections — "did any runs fail?" is
    // how the question is actually asked.
    test: [/\bfail(ed|ing|ure|s)?\b/i, /\berrors?\b/i, /\bbroke(n)?\b/i, /what went wrong/i],
    answer: (c) => {
      const failed = c.runs.filter((r) => r.status === "Failed");
      const ok = c.runs.filter((r) => r.status === "Succeeded").length;
      const waiting = c.runs.filter((r) => r.status === "Awaiting review").length;
      if (failed.length === 0) {
        return {
          text: `No failed runs in ${c.marketFlag} **${c.marketName}**. Of ${c.runs.length} ${plural(c.runs.length, "run")}, ${ok} succeeded and ${waiting} ${verb(waiting, "is", "are")} parked awaiting review.`,
          link: { to: "/runs", label: "Open Runs" },
          sources: ["runs.market_scoped"],
        };
      }
      return {
        text: `**${failed.length}** ${plural(failed.length, "run")} failed in ${c.marketFlag} **${c.marketName}**. Each one can be retried from the node that failed rather than reprocessed from the start.`,
        rows: failed.map((r) => ({ label: r.flow, value: r.id, tone: "danger" as const })),
        link: { to: "/runs", label: "Inspect failures" },
        sources: ["runs.market_scoped"],
      };
    },
  },
  {
    id: "run-health",
    test: [/run (status|health|summary)/i, /how (are|is) (the )?(runs?|automation)/i, /completion rate/i, /throughput/i],
    answer: (c) => {
      const ok = c.runs.filter((r) => r.status === "Succeeded").length;
      const waiting = c.runs.filter((r) => r.status === "Awaiting review").length;
      const failed = c.runs.filter((r) => r.status === "Failed").length;
      return {
        text: `${c.marketFlag} **${c.marketName}** has ${c.runs.length} ${plural(c.runs.length, "run")} across ${c.flowCount} active ${plural(c.flowCount, "flow")}, completing at *${pct(ok, c.runs.length)}*.`,
        rows: [
          { label: "Succeeded", value: String(ok), tone: "success" },
          { label: "Awaiting review", value: String(waiting), tone: "warning" },
          { label: "Failed", value: String(failed), tone: failed ? "danger" : "default" },
        ],
        link: { to: "/runs", label: "Open Runs" },
        sources: ["runs.market_scoped", "flows.market_scoped"],
      };
    },
  },
  {
    id: "reviewers",
    test: [/reviewer/i, /who (closed|handled|processed)/i, /top performer/i, /by throughput/i],
    answer: (c) => ({
      text: `Reviewers ranked by items closed. Override rate is the share where a human disagreed with the flow — a *rising* override rate usually means the automation needs attention, not the reviewer.`,
      rows: c.reviewers.slice(0, 5).map((r) => ({
        label: r.name,
        value: `${r.closed} closed · ${r.overrideRate}% override`,
      })),
      link: { to: "/insights", label: "Open Insights" },
      sources: ["insights.reviewers"],
    }),
  },
  {
    id: "placements",
    test: [/placement/i, /quote/i, /carrier/i, /broker/i, /bind/i],
    answer: (c) => {
      if (c.placements.length === 0) {
        return {
          text: `No placements in ${c.marketFlag} **${c.marketName}** yet.`,
          link: { to: "/placements", label: "Open Placements" },
        };
      }
      const open = c.placements.filter((p) => p.stage !== "Bound" && p.stage !== "Lost");
      const awaiting = c.placements.reduce(
        (n, p) => n + p.quotes.filter((q) => q.status === "Pending").length,
        0
      );
      return {
        text: `**${open.length} open ${plural(open.length, "placement")}** in ${c.marketFlag} **${c.marketName}**, with ${awaiting} ${plural(awaiting, "quote")} still awaiting a carrier response.`,
        rows: open.slice(0, 5).map((p) => ({
          label: p.client,
          value: `${p.stage} · ${p.quotes.length} ${plural(p.quotes.length, "quote")}`,
        })),
        link: { to: "/placements", label: "Open Placements" },
        sources: ["placements.market_scoped"],
      };
    },
  },
  {
    id: "waiting-period",
    test: [/waiting period/i, /wait(ing)? time/i, /deductible/i, /benefit (limit|schedule)/i, /covered/i, /exclusion/i],
    answer: (c) => {
      const found: AnswerRow[] = [];
      for (const p of c.products) {
        for (const plan of p.plans) {
          for (const b of plan.benefits) {
            if (b.waiting) {
              found.push({ label: `${p.name} · ${b.name}`, value: b.waiting });
            }
          }
        }
      }
      if (found.length === 0) {
        return {
          text: `No waiting periods are defined on the ${c.products.length} ${plural(c.products.length, "product")} sold in ${c.marketFlag} **${c.marketName}**. Waiting periods live on the benefit schedule, so a product without one has no restriction to quote.`,
          link: { to: "/products", label: "Open Products" },
        };
      }
      return {
        text: `Waiting periods on benefits sold in ${c.marketFlag} **${c.marketName}**. These are read from the product definition, which is the same source the claim flow adjudicates against.`,
        rows: found.slice(0, 6),
        link: { to: "/products", label: "Open Products" },
        sources: ["products.benefit_schedule"],
      };
    },
  },
  {
    id: "takaful",
    test: [/takaful/i, /shariah/i, /wakalah/i, /mudharabah/i, /tabarru/i],
    answer: (c) => {
      const tk = c.products.filter((p) => p.shariah);
      if (!c.takaful || tk.length === 0) {
        return {
          text: `${c.marketFlag} **${c.marketName}** has no Takaful products. Takaful structures apply in Malaysia and Indonesia, where a Shariah board approval step is required in the flow before a contribution can be allocated.`,
        };
      }
      return {
        text: `**${tk.length}** Takaful ${plural(tk.length, "product")} in ${c.marketFlag} **${c.marketName}**. Each carries its Shariah structure and board approval on the product itself, so the claim flow can prove the basis of a decision.`,
        rows: tk.map((p) => ({
          label: p.name,
          value: `${p.shariah!.model} · ${p.shariah!.board}`,
        })),
        link: { to: "/products", label: "Open Products" },
        sources: ["products.shariah"],
      };
    },
  },
  {
    id: "products",
    test: [/product/i, /what do we sell/i, /catalogue|catalog/i, /plans?\b/i],
    answer: (c) => ({
      text: `**${c.products.length}** ${plural(c.products.length, "product")} sold in ${c.marketFlag} **${c.marketName}**, priced in ${c.currency} and filed with ${c.regulator}.`,
      rows: c.products.map((p) => ({
        label: p.name,
        value: `${p.line} · ${p.status} · ${p.version}`,
        tone: p.status === "Published" ? ("success" as const) : ("default" as const),
      })),
      link: { to: "/products", label: "Open Products" },
      sources: ["products.market_scoped"],
    }),
  },
  {
    id: "market-overview",
    test: [/overview/i, /summar(y|ise|ize)/i, /how are we doing/i, /status/i, /dashboard/i],
    answer: (c) => ({
      text: `${c.marketFlag} **${c.marketName}** — regulated by ${c.regulator}, transacting in ${c.currency}.`,
      rows: [
        {
          label: "Work items",
          value: (() => {
            const n = c.items.filter((i) => i.status === "Requires Review").length;
            return `${c.items.length} (${n} ${verb(n, "needs", "need")} review)`;
          })(),
        },
        { label: "Runs", value: `${c.runs.length} (${c.runs.filter((r) => r.status === "Failed").length} failed)` },
        { label: "Active flows", value: String(c.flowCount) },
        { label: "Products", value: String(c.products.length) },
        { label: "Open placements", value: String(c.placements.filter((p) => p.stage !== "Bound" && p.stage !== "Lost").length) },
      ],
      link: { to: "/insights", label: "Open Insights" },
      sources: ["market_data.scoped"],
    }),
  },
];

/** Offered when nothing matches — every one of these resolves to a real answer. */
export const suggestedQuestions = [
  "What needs review right now?",
  "Show items assigned to me",
  "Did any runs fail?",
  "What products do we sell here?",
  "Any Takaful products in this market?",
  "Give me a market overview",
];

export function askCopilot(question: string, c: CopilotContext): CopilotAnswer {
  const q = question.trim();
  if (!q) {
    return { text: "Ask me about the work in this market — the queue, runs, products or placements." };
  }

  for (const intent of intents) {
    if (intent.test.some((re) => re.test(q))) return intent.answer(c);
  }

  // Refusing clearly beats inventing. The scope is stated so the next question
  // is likelier to land, and every suggestion below is known to resolve.
  return {
    text: `I can't answer that one yet. I read live data for ${c.marketFlag} **${c.marketName}** — the review queue, runs and failures, products and benefit schedules, Takaful structures, placements, and reviewer throughput.\n\nTry one of these:`,
    rows: suggestedQuestions.slice(0, 4).map((s) => ({ label: s, value: "" })),
  };
}
