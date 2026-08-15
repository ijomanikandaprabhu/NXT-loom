import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Node } from "@xyflow/react";
import type { FlowNodeData } from "@/data/flow-graphs";

export type StepStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped"
  | "waiting";

export type RunStep = {
  /** Matches the canvas node id so the graph can be highlighted. */
  nodeId: string;
  name: string;
  key: string;
  kind: string;
  /** Loop body steps show their iteration path, as Bevaya does. */
  loopPath?: string;
  status: StepStatus;
  durationMs: number;
  startedAt?: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  diagnostics: { level: "info" | "warn" | "error"; at: string; message: string }[];
};

export type RunState = "idle" | "running" | "paused" | "complete" | "failed";

const EXEC_ID = "019dc51a-6913-77d6-9da2-ecbbf1e746f7";

function seedInput(step: { key: string; kind: string }): Record<string, unknown> {
  return {
    _flow_execution_id: EXEC_ID,
    _is_persistence_metadata: true,
    _organization_id: "org_nxtloom_demo",
    _workspace_id: "ws_production",
    _step_started_at: new Date().toISOString(),
    _node_key: step.key,
    _node_kind: step.kind,
  };
}

function seedOutput(step: { kind: string; key: string }): Record<string, unknown> {
  switch (step.kind) {
    case "trigger":
      return { received: 1, channel: step.key, attachments: 4 };
    case "action":
      return { ok: true, pages_processed: 11, unreadable_pages: 0 };
    case "ai":
      return {
        fields_extracted: 24,
        avg_confidence: 0.91,
        below_threshold: 2,
        model: "NXT Extract",
      };
    case "switch":
      return { branch_taken: "default", evaluated: 8 };
    case "code":
      return { ok: true, mutated_keys: ["normalised", "validated"] };
    case "insights":
      return { summary_chars: 842, citations: 6 };
    case "review":
      return { queued: true, assignee: "unassigned", sla_hours: 4 };
    default:
      return { ok: true };
  }
}

/** Builds an execution plan from the canvas graph. */
export function buildPlan(nodes: Node<FlowNodeData>[]): RunStep[] {
  return nodes
    .filter((n) => n.data.kind !== "group")
    .map((n) => {
      const inLoop = Boolean(n.parentId);
      const isLoopLabel = n.data.subtitle?.includes("for each");
      return {
        nodeId: n.id,
        name: isLoopLabel ? n.data.title : n.data.title,
        key: n.data.subtitle || n.id,
        kind: n.data.kind,
        loopPath: inLoop ? `Loop: /do/2/${n.data.subtitle ?? n.id}` : undefined,
        status: "pending" as StepStatus,
        durationMs: 0,
        input: seedInput({ key: n.data.subtitle ?? n.id, kind: n.data.kind }),
        diagnostics: [],
      };
    });
}

const now = () =>
  new Date().toLocaleTimeString("en-GB", { hour12: false }) +
  "." +
  String(new Date().getMilliseconds()).padStart(3, "0");

export function useFlowRun(nodes: Node<FlowNodeData>[]) {
  const [state, setState] = useState<RunState>("idle");
  const [steps, setSteps] = useState<RunStep[]>([]);
  const [cursor, setCursor] = useState(-1);
  const timer = useRef<number | null>(null);

  const plan = useMemo(() => buildPlan(nodes), [nodes]);

  const clearTimer = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const start = useCallback(() => {
    clearTimer();
    setSteps(plan.map((s) => ({ ...s })));
    setCursor(-1);
    setState("running");
  }, [plan]);

  const stop = useCallback(() => {
    clearTimer();
    setState("idle");
    setSteps([]);
    setCursor(-1);
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    setState((s) => (s === "running" ? "paused" : s));
  }, []);

  const resume = useCallback(() => {
    setState((s) => (s === "paused" ? "running" : s));
  }, []);

  /** Advance exactly one step, then hold. */
  const step = useCallback(() => {
    clearTimer();
    setState("paused");
    setCursor((c) => {
      const next = c + 1;
      if (next >= plan.length) {
        setState("complete");
        return c;
      }
      advance(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.length]);

  /** Marks a step complete with a plausible duration and diagnostics. */
  function advance(index: number) {
    setSteps((prev) => {
      const next = [...prev];
      const s = next[index];
      if (!s) return prev;

      // A review node parks the run rather than completing it.
      if (s.kind === "review") {
        next[index] = {
          ...s,
          status: "waiting",
          startedAt: now(),
          durationMs: 0,
          diagnostics: [
            { level: "info", at: now(), message: "Work item created, run paused pending reviewer decision" },
          ],
        };
        return next;
      }

      const duration =
        s.kind === "ai" ? 1800 + Math.random() * 2600
        : s.kind === "action" ? 300 + Math.random() * 1500
        : s.kind === "code" ? 40 + Math.random() * 260
        : 2 + Math.random() * 30;

      // One deterministic soft-failure so the console has something to show.
      const isFlaky = s.key.includes("ocr") && index % 3 === 2;

      next[index] = {
        ...s,
        status: isFlaky ? "skipped" : "succeeded",
        startedAt: now(),
        durationMs: isFlaky ? 0 : Math.round(duration),
        output: isFlaky ? undefined : seedOutput(s),
        diagnostics: isFlaky
          ? [{ level: "warn", at: now(), message: "No input for this loop iteration — step skipped" }]
          : [
              { level: "info", at: now(), message: `Started ${s.key}` },
              { level: "info", at: now(), message: `Completed in ${Math.round(duration)}ms` },
            ],
      };
      return next;
    });
  }

  /** Auto-advance while running. */
  useEffect(() => {
    if (state !== "running") return;
    const next = cursor + 1;
    if (next >= steps.length) {
      setState("complete");
      return;
    }

    setSteps((prev) => {
      const copy = [...prev];
      if (copy[next]) copy[next] = { ...copy[next], status: "running", startedAt: now() };
      return copy;
    });

    timer.current = window.setTimeout(() => {
      advance(next);
      setCursor(next);
      // A review step halts the run until a human acts.
      if (steps[next]?.kind === "review") setState("paused");
    }, 620);

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, cursor, steps.length]);

  useEffect(() => clearTimer, []);

  const current = cursor >= 0 ? steps[cursor] : undefined;
  const totalMs = steps.reduce((n, s) => n + s.durationMs, 0);

  return { state, steps, cursor, current, totalMs, start, stop, pause, resume, step };
}
