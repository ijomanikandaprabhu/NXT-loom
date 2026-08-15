import { ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RunStep, StepStatus } from "@/lib/use-flow-run";
import { cn } from "@/lib/utils";

const barTone: Record<StepStatus, string> = {
  pending: "bg-transparent",
  running: "bg-primary/25 border border-primary",
  succeeded: "bg-success",
  failed: "bg-destructive",
  skipped: "bg-muted-foreground/25 border border-dashed border-muted-foreground/50",
  waiting: "bg-warning",
};

function fmt(ms: number) {
  if (ms === 0) return "0ms";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function RunConsole({
  steps,
  cursor,
  selectedIndex,
  onSelect,
  collapsed,
  onToggle,
}: {
  steps: RunStep[];
  cursor: number;
  selectedIndex: number;
  onSelect: (i: number) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  // Bars are laid out on a shared timeline so the waterfall reads as elapsed time.
  const total = Math.max(
    steps.reduce((n, s) => n + s.durationMs, 0),
    1
  );
  let elapsed = 0;
  const laid = steps.map((s) => {
    const offset = elapsed;
    elapsed += s.durationMs;
    return { step: s, offsetPct: (offset / total) * 100, widthPct: (s.durationMs / total) * 100 };
  });

  return (
    <div className="border-t bg-card shrink-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center py-1 hover:bg-secondary/60 transition-colors cursor-pointer"
        title={collapsed ? "Show run console" : "Hide run console"}
      >
        {collapsed ? <ChevronUp className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
      </button>

      {!collapsed && (
        <ScrollArea className="h-[210px]">
          <div className="pb-2">
            {laid.map(({ step, offsetPct, widthPct }, i) => (
              <button
                key={`${step.nodeId}-${i}`}
                onClick={() => onSelect(i)}
                className={cn(
                  "w-full grid grid-cols-[190px_1fr_54px] items-center gap-2 px-3 py-1.5 text-left transition-colors cursor-pointer border-l-2",
                  selectedIndex === i
                    ? "bg-accent/60 border-primary"
                    : cursor === i
                      ? "bg-primary/[0.06] border-primary/40"
                      : "border-transparent hover:bg-secondary/60"
                )}
              >
                <div className="min-w-0">
                  <div className="text-[11.5px] font-medium truncate">{step.name}</div>
                  {step.loopPath && (
                    <div className="text-[9.5px] text-muted-foreground font-mono truncate">
                      {step.loopPath}
                    </div>
                  )}
                </div>

                <div className="relative h-4">
                  <div className="absolute inset-y-0 left-0 right-0 rounded-sm bg-secondary/40" />
                  {step.status !== "pending" && (
                    <div
                      className={cn(
                        "absolute inset-y-0 rounded-sm min-w-[3px] flex items-center justify-end pr-1.5",
                        barTone[step.status],
                        step.status === "running" && "animate-pulse"
                      )}
                      style={{
                        left: `${offsetPct}%`,
                        width: `${Math.max(widthPct, step.durationMs ? 1.5 : 0.6)}%`,
                      }}
                    >
                      {widthPct > 8 && (
                        <span className="text-[9px] font-bold text-white/90">
                          {fmt(step.durationMs)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[10.5px] text-muted-foreground tabular-nums text-right">
                  {step.status === "pending" ? "—" : fmt(step.durationMs)}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
