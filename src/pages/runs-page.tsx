import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Ban, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, type Status } from "@/components/shell/status-badge";
import { runs, runKpis, type RunStatus, type StepStatus } from "@/data/runs";
import { useStaggerReveal } from "@/lib/use-stagger-reveal";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const statusMap: Record<RunStatus, Status> = {
  Succeeded: "success",
  Failed: "danger",
  Running: "info",
  "Awaiting review": "warning",
  Retrying: "neutral",
  Cancelled: "neutral",
};

const stepDot: Record<StepStatus, string> = {
  succeeded: "bg-success",
  failed: "bg-destructive",
  running: "bg-info animate-pulse",
  waiting: "bg-warning",
  retried: "bg-warning",
  skipped: "bg-muted-foreground/30",
};

const kpiTone = {
  primary: { border: "border-primary/25", bg: "bg-primary/[0.05]", text: "" },
  success: { border: "border-success/25", bg: "bg-success/[0.05]", text: "text-success" },
  warning: { border: "border-warning/25", bg: "bg-warning/[0.06]", text: "text-warning" },
  danger: { border: "border-destructive/25", bg: "bg-destructive/[0.05]", text: "text-destructive" },
  info: { border: "border-info/25", bg: "bg-info/[0.05]", text: "" },
};

const filters = ["All", "prod", "staging"] as const;

export default function RunsPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [env, setEnv] = useState<(typeof filters)[number]>("All");
  const [selectedId, setSelectedId] = useState(runs[0].id);

  const shown = runs.filter((r) => env === "All" || r.environment === env);
  const selected = runs.find((r) => r.id === selectedId) ?? shown[0];
  const listRef = useStaggerReveal<HTMLDivElement>([env]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-3 border-b px-6 py-4 shrink-0 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight">{t("runs.title")}</h1>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            {t("runs.subtitle")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            {filters.map((f, i) => (
              <button
                key={f}
                onClick={() => setEnv(f)}
                className={cn(
                  "px-3 py-2 text-[12px] font-semibold transition-colors cursor-pointer",
                  f === env ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary",
                  i > 0 && "border-l"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">{t("common.export")}</Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 px-6 py-4 border-b shrink-0">
        {runKpis.map((k) => {
          const tone = kpiTone[k.tone];
          return (
            <div key={k.l} className={cn("rounded-xl border p-3.5", tone.border, tone.bg)}>
              <div className={cn("text-[22px] font-bold tracking-tight tabular-nums", tone.text)}>{k.n}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{k.l}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[1fr_1.1fr] flex-1 min-h-0">
        <div ref={listRef} className="border-r min-h-0 flex flex-col">
          <ScrollArea className="flex-1 min-h-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run</TableHead>
                  <TableHead>Automation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((r) => (
                  <TableRow
                    key={r.id}
                    data-stagger-item
                    data-state={selectedId === r.id ? "selected" : undefined}
                    onClick={() => setSelectedId(r.id)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="font-mono text-[11.5px] text-muted-foreground">{r.id}</div>
                      <div className="text-[10.5px] text-muted-foreground/70 mt-0.5">{r.started}</div>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="text-[12.5px] font-medium truncate">{r.flow}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground border rounded px-1">{r.line}</span>
                        <span className="text-[10.5px] text-muted-foreground">{r.trigger} · {r.version}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={statusMap[r.status]}>{r.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[12.5px]">{r.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <ScrollArea className="min-h-0">
          {selected && (
            <>
              <div className="px-6 py-4 border-b">
                <div className="font-mono text-[12px] text-muted-foreground">
                  {selected.id} · {selected.version} · {selected.environment}
                </div>
                <h3 className="text-[15px] font-bold mt-1">{selected.flow}</h3>
                <p className="text-[11.5px] text-muted-foreground mt-1">
                  Triggered by {selected.requester} · {selected.trigger} · {selected.started}
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <RotateCcw className="size-3.5" /> Retry from failed node
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Play className="size-3.5" /> Replay in staging
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Ban className="size-3.5" /> Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => navigate(`/flows/${selected.flowId}`)}
                  >
                    <ExternalLink className="size-3.5" /> Open flow
                  </Button>
                </div>
              </div>

              <div className="px-6 py-3">
                {selected.steps.map((s, i) => (
                  <div key={s.key} className="flex gap-3 py-3 border-b border-dashed last:border-none">
                    <div className="flex flex-col items-center w-4 shrink-0">
                      <span className={cn("size-2.5 rounded-full ring-1 ring-border ring-offset-2 ring-offset-background", stepDot[s.status])} />
                      {i < selected.steps.length - 1 && <span className="flex-1 w-px bg-border mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12.5px] font-semibold">{s.node}</span>
                        {s.attempt && (
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-warning/15 text-warning rounded px-1.5 py-0.5">
                            attempt {s.attempt}
                          </span>
                        )}
                        <span className="ml-auto text-[11px] font-mono text-muted-foreground/70">{s.duration}</span>
                      </div>
                      <div className="font-mono text-[10.5px] text-muted-foreground/70 mt-0.5">{s.key}</div>
                      <div className="text-[11.5px] text-muted-foreground mt-1">{s.detail}</div>
                      {s.io && (
                        <pre className="mt-2 font-mono text-[10.5px] bg-secondary border rounded-md px-2.5 py-2 text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                          {s.io}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
