import { useState } from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RunStep, StepStatus } from "@/lib/use-flow-run";
import { cn } from "@/lib/utils";

const statusTone: Record<StepStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  running: "bg-info/15 text-info",
  succeeded: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  skipped: "bg-muted text-muted-foreground",
  waiting: "bg-warning/15 text-warning",
};

const tabs = ["Input", "Output", "Diagnostics"] as const;

/** Renders a value with its inferred type, the way the run console does. */
function ValueRow({ k, v }: { k: string; v: unknown }) {
  const type = Array.isArray(v)
    ? "array"
    : v === null
      ? "null"
      : typeof v === "object"
        ? "object"
        : typeof v === "boolean"
          ? "boolean"
          : typeof v === "number"
            ? "number"
            : /^\d{4}-\d{2}-\d{2}T/.test(String(v))
              ? "datetime"
              : "string";

  const display =
    typeof v === "object" && v !== null ? JSON.stringify(v) : String(v);

  return (
    <div className="py-1.5 border-b border-dashed last:border-none">
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[11px] font-medium">{k}</span>
        <span className="text-[9.5px] text-muted-foreground">{type}</span>
      </div>
      <div className="font-mono text-[11px] text-muted-foreground break-all mt-0.5">
        {display}
      </div>
    </div>
  );
}

export function StepInspector({ step }: { step?: RunStep }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Input");

  if (!step) {
    return (
      <div className="w-[300px] shrink-0 border-l bg-card flex items-center justify-center p-6">
        <p className="text-[12px] text-muted-foreground text-center">
          Select a step in the console below to inspect its input, output, and diagnostics.
        </p>
      </div>
    );
  }

  return (
    <div className="w-[300px] shrink-0 border-l bg-card flex flex-col min-h-0">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-[13px] font-bold">{step.name}</h3>
          <span className="font-mono text-[10px] rounded bg-secondary border px-1.5 py-0.5 text-muted-foreground">
            {step.key}
          </span>
          <span
            className={cn(
              "ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] text-[10px] font-bold uppercase tracking-wide",
              statusTone[step.status]
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {step.status}
          </span>
        </div>
        {step.startedAt && (
          <div className="text-[10.5px] text-muted-foreground mt-1 font-mono">
            started {step.startedAt}
          </div>
        )}
      </div>

      <div className="flex border-b">
        {tabs.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={cn(
              "flex-1 px-2 py-2 text-[11.5px] font-medium transition-colors cursor-pointer border-b-2",
              tab === tb
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tb}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 py-2">
          {tab === "Input" &&
            Object.entries(step.input).map(([k, v]) => <ValueRow key={k} k={k} v={v} />)}

          {tab === "Output" &&
            (step.output ? (
              Object.entries(step.output).map(([k, v]) => <ValueRow key={k} k={k} v={v} />)
            ) : (
              <p className="text-[11.5px] text-muted-foreground py-3">
                {step.status === "pending"
                  ? "This step has not run yet."
                  : step.status === "skipped"
                    ? "Step was skipped — no output produced."
                    : step.status === "waiting"
                      ? "Waiting on a reviewer decision before this step produces output."
                      : "No output."}
              </p>
            ))}

          {tab === "Diagnostics" &&
            (step.diagnostics.length ? (
              <div className="space-y-2 py-1">
                {step.diagnostics.map((d, i) => {
                  const Icon =
                    d.level === "error" ? XCircle : d.level === "warn" ? AlertTriangle : Info;
                  return (
                    <div key={i} className="flex gap-2">
                      <Icon
                        className={cn(
                          "size-3.5 shrink-0 mt-0.5",
                          d.level === "error"
                            ? "text-destructive"
                            : d.level === "warn"
                              ? "text-warning"
                              : "text-muted-foreground"
                        )}
                      />
                      <div className="min-w-0">
                        <div className="text-[11.5px] leading-snug">{d.message}</div>
                        <div className="text-[9.5px] text-muted-foreground font-mono mt-0.5">
                          {d.at}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11.5px] text-muted-foreground py-3">
                No diagnostics recorded for this step.
              </p>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}
