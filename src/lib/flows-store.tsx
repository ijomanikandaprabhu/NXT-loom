import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Node, Edge } from "@xyflow/react";
import { flows as seedFlows, type Flow } from "@/data/flows";
import { flowGraphs, type FlowGraph, type FlowNodeData, type NodeKind } from "@/data/flow-graphs";
import type { ProposedStep } from "@/lib/flow-assistant";
import type { MarketCode } from "@/data/locale";

/**
 * Flows created in the app, alongside the seeded ones.
 *
 * A generated flow lands here as an inactive draft. That is the whole safety
 * argument: refusing to create anything at all just meant drawing the same
 * graph by hand, which is not safer, only slower. What must never happen
 * automatically is promotion to production — and that still cannot.
 */

const STORE = "nxtloom.flowsCreated";

type StoredFlow = { flow: Flow; graph: FlowGraph };

type FlowsValue = {
  flows: Flow[];
  graphFor: (id: string) => FlowGraph | undefined;
  isCustom: (id: string) => boolean;
  createFromProposal: (
    title: string,
    steps: ProposedStep[],
    market: MarketCode,
    line?: string
  ) => Flow;
  remove: (id: string) => void;
  reset: () => void;
  createdCount: number;
};

const FlowsContext = createContext<FlowsValue | null>(null);

/** Proposal step kinds map onto the canvas node kinds the studio renders. */
const nodeKindFor: Record<ProposedStep["kind"], NodeKind> = {
  intake: "trigger",
  ocr: "action",
  extract: "ai",
  switch: "switch",
  rule: "code",
  review: "review",
  action: "action",
};

/** Snake-cased subtitle, matching how the seeded graphs label their nodes. */
const keyOf = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);

function graphFromSteps(steps: ProposedStep[]): FlowGraph {
  const COLS = 4;
  const nodes: Node<FlowNodeData>[] = steps.map((s, i) => ({
    id: `n${i}`,
    type: "custom",
    // Laid out in rows rather than one long line: a nine-step flow off the
    // right edge of the canvas looks broken before anyone has read it.
    position: { x: 40 + (i % COLS) * 250, y: 40 + Math.floor(i / COLS) * 150 },
    data: {
      kind: nodeKindFor[s.kind],
      title: s.name,
      subtitle: keyOf(s.detail || s.name),
    },
  }));

  const edges: Edge[] = steps.slice(1).map((_, i) => ({
    id: `e${i}`,
    source: `n${i}`,
    target: `n${i + 1}`,
  }));

  return { nodes, edges };
}

function read(): StoredFlow[] {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as StoredFlow[]) : [];
  } catch {
    return [];
  }
}

export function FlowsProvider({ children }: { children: React.ReactNode }) {
  const [created, setCreated] = useState<StoredFlow[]>(read);

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(created));
  }, [created]);

  const value = useMemo<FlowsValue>(() => {
    const customIds = new Set(created.map((c) => c.flow.id));
    return {
      flows: [...created.map((c) => c.flow), ...seedFlows],
      graphFor: (id) => created.find((c) => c.flow.id === id)?.graph ?? flowGraphs[id],
      isCustom: (id) => customIds.has(id),
      createdCount: created.length,
      remove: (id) => setCreated((prev) => prev.filter((c) => c.flow.id !== id)),
      reset: () => setCreated([]),
      createFromProposal: (title, steps, market, line) => {
        const id = `flow-${Date.now().toString(36)}`;
        const flow: Flow = {
          id,
          name: title,
          // Inactive on purpose. A generated flow that arrives switched on has
          // skipped the review it exists to receive.
          active: false,
          created: new Date().toLocaleDateString("en-GB"),
          markets: [market],
          line,
        };
        setCreated((prev) => [{ flow, graph: graphFromSteps(steps) }, ...prev]);
        return flow;
      },
    };
  }, [created]);

  return <FlowsContext.Provider value={value}>{children}</FlowsContext.Provider>;
}

export function useFlows() {
  const ctx = useContext(FlowsContext);
  if (!ctx) throw new Error("useFlows must be used inside <FlowsProvider>");
  return ctx;
}
