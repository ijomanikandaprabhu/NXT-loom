import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  headline,
  stpSeries,
  byLine,
  agentPerf,
  reviewers,
  calibration,
} from "@/data/insights-data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const lineTone: Record<string, string> = {
  "P&C": "bg-primary",
  Health: "bg-info",
  Life: "bg-warning",
};

export default function InsightsPage() {
  const { t } = useI18n();
  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 pt-7 pb-16 max-w-[1140px] mx-auto w-full">
        <h1 className="text-[24px] font-bold tracking-tight">{t("insights.title")}</h1>
        <p className="text-muted-foreground text-[13.5px] mt-1">
          {t("insights.subtitle")}
        </p>

        {/* headline metrics */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {headline.map((m) => (
            <div key={m.label} className="rounded-xl border bg-card p-4">
              <div className="text-[11px] text-muted-foreground">{m.label}</div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-[24px] font-bold tracking-tight tabular-nums">{m.value}</span>
                {m.delta && (
                  <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-bold", m.up ? "text-success" : "text-destructive")}>
                    {m.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {m.delta}
                  </span>
                )}
              </div>
              <div className="text-[10.5px] text-muted-foreground/80 mt-1.5">{m.hint}</div>
            </div>
          ))}
        </div>

        {/* STP trend + by line */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-4 mt-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[13.5px] font-bold">Straight-through processing</h3>
              <span className="text-[11px] text-muted-foreground">Last 14 days</span>
            </div>
            <StpChart />
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-[13.5px] font-bold">By line of business</h3>
            <div className="mt-4 space-y-4">
              {byLine.map((l) => (
                <div key={l.line}>
                  <div className="flex items-center gap-2 text-[12px]">
                    <span className={cn("size-2 rounded-full", lineTone[l.line])} />
                    <span className="font-semibold">{l.line}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {l.items.toLocaleString()} items
                    </span>
                    <span className="ml-auto font-bold tabular-nums">{l.stp}%</span>
                  </div>
                  <Progress
                    value={l.stp}
                    className="h-1.5 mt-1.5"
                    indicatorClassName={lineTone[l.line]}
                  />
                  <div className="text-[10.5px] text-muted-foreground mt-1">
                    {l.accuracy}% accuracy · {l.review.toLocaleString()} reviewed
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* agent performance */}
        <h3 className="text-[13.5px] font-bold mt-8 mb-2.5">AI agent performance</h3>
        <div className="border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead className="text-right">Runs</TableHead>
                <TableHead>STP rate</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
                <TableHead className="text-right">30-day drift</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentPerf.map((a) => (
                <TableRow key={a.agent} className="cursor-pointer">
                  <TableCell className="text-[12.5px] font-semibold">{a.agent}</TableCell>
                  <TableCell className="text-[12px] text-muted-foreground">{a.workspace}</TableCell>
                  <TableCell className="text-right tabular-nums text-[12.5px]">
                    {a.runs.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={a.stp}
                        className="w-16 h-1.5"
                        indicatorClassName={a.stp >= 85 ? "bg-success" : a.stp >= 75 ? "bg-warning" : "bg-destructive"}
                      />
                      <span className="text-[11.5px] font-semibold tabular-nums">{a.stp}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[12.5px]">{a.accuracy}%</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-[11.5px] font-bold tabular-nums",
                        a.drift >= 0 ? "text-success" : a.drift < -1 ? "text-destructive" : "text-warning"
                      )}
                    >
                      {a.drift >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      {a.drift > 0 ? "+" : ""}{a.drift}pt
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* calibration + reviewers */}
        <div className="grid grid-cols-[1.15fr_1fr] gap-4 mt-8">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-start gap-2">
              <div>
                <h3 className="text-[13.5px] font-bold">Confidence calibration</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[46ch]">
                  Whether a stated confidence matches the real hit rate. Bars that track together mean
                  the threshold can be trusted for routing.
                </p>
              </div>
              <Info className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
            </div>
            <div className="mt-4 space-y-2.5">
              {calibration.map((c) => (
                <div key={c.bucket} className="flex items-center gap-3">
                  <span className="text-[10.5px] font-mono text-muted-foreground w-14 shrink-0">{c.bucket}</span>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary/40 rounded-full" style={{ width: `${c.predicted}%` }} />
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: `${c.actual}%` }} />
                    </div>
                  </div>
                  <span className="text-[10.5px] tabular-nums text-muted-foreground w-12 text-right shrink-0">
                    {c.actual > c.predicted ? "+" : ""}{c.actual - c.predicted}pt
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-[10.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary/40" /> Stated confidence
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-success" /> Actual accuracy
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-[13.5px] font-bold">Reviewer throughput</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">This week, by items closed.</p>
            <div className="mt-4 space-y-3">
              {reviewers.map((r, i) => (
                <div key={r.name} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-muted-foreground w-4 tabular-nums">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold truncate">{r.name}</div>
                    <div className="text-[10.5px] text-muted-foreground">
                      {r.avgTime} avg · {r.overrideRate}% override
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Progress
                      value={(r.closed / reviewers[0].closed) * 100}
                      className="w-16 h-1.5"
                      indicatorClassName="bg-primary"
                    />
                    <span className="text-[12px] font-bold tabular-nums w-8 text-right">{r.closed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StpChart() {
  const w = 560;
  const h = 150;
  const pad = 8;
  const min = 74;
  const max = 92;
  const pts = stpSeries.map((v, i) => {
    const x = pad + (i / (stpSeries.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;
  const last = pts[pts.length - 1];

  return (
    <div className="mt-3 overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[420px]" role="img" aria-label="Straight-through processing trend">
        <defs>
          <linearGradient id="stp-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={w - pad}
            y1={pad + f * (h - pad * 2)}
            y2={pad + f * (h - pad * 2)}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill="url(#stp-fill)" />
        <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={last[0]} cy={last[1]} r="4" fill="var(--primary)" />
        <circle cx={last[0]} cy={last[1]} r="8" fill="var(--primary)" opacity="0.18" />
      </svg>
      <div className="flex items-center justify-between text-[10.5px] text-muted-foreground mt-1 px-1">
        <span>14 days ago</span>
        <span className="font-semibold text-foreground tabular-nums">87.4% today</span>
      </div>
    </div>
  );
}
