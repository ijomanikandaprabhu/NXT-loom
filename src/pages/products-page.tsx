import { useState } from "react";
import { Plus, Layers3, ShieldCheck, Globe2, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge, type Status } from "@/components/shell/status-badge";
import { products, type Line } from "@/data/products";
import { marketByCode } from "@/data/locale";
import { useStaggerReveal } from "@/lib/use-stagger-reveal";
import { cn } from "@/lib/utils";

const lines: (Line | "All")[] = ["All", "Health", "Life", "Motor", "Takaful", "Micro"];

const lineTone: Record<Line, string> = {
  Health: "bg-info/15 text-info",
  Life: "bg-primary/15 text-primary",
  Motor: "bg-warning/15 text-warning",
  Takaful: "bg-success/15 text-success",
  Micro: "bg-destructive/15 text-destructive",
};

const statusMap: Record<string, Status> = {
  Published: "success",
  "In review": "warning",
  Draft: "neutral",
};

export default function ProductsPage() {
  const [line, setLine] = useState<(typeof lines)[number]>("All");
  const [selectedId, setSelectedId] = useState(products[0].id);

  const shown = products.filter((p) => line === "All" || p.line === line);
  const selected = products.find((p) => p.id === selectedId) ?? shown[0];
  const listRef = useStaggerReveal<HTMLDivElement>([line]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-3 border-b px-6 py-4 shrink-0 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight">Product Builder</h1>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Configure insurance products, plans, and rules without code — then publish to every channel.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            {lines.map((l, i) => (
              <button
                key={l}
                onClick={() => setLine(l)}
                className={cn(
                  "px-3 py-2 text-[12px] font-semibold transition-colors cursor-pointer",
                  l === line ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary",
                  i > 0 && "border-l"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" /> New product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[300px_1fr] flex-1 min-h-0">
        <ScrollArea className="border-r min-h-0">
          <div ref={listRef}>
            {shown.map((p) => (
              <button
                key={p.id}
                data-stagger-item
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  "w-full text-left px-4 py-3.5 border-b block transition-colors cursor-pointer",
                  selectedId === p.id ? "bg-accent" : "hover:bg-secondary"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold rounded px-1.5 py-0.5", lineTone[p.line])}>
                    {p.line}
                  </span>
                  <span className="ml-auto font-mono text-[10.5px] text-muted-foreground">{p.version}</span>
                </div>
                <div className="text-[13px] font-semibold mt-1.5">{p.name}</div>
                {p.localName && (
                  <div className="text-[11px] text-muted-foreground italic">{p.localName}</div>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge status={statusMap[p.status]}>{p.status}</StatusBadge>
                  <span className="text-[11px]">
                    {p.markets.map((mc) => marketByCode(mc).flag).join(" ")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <ScrollArea className="min-h-0">
          {selected && (
            <div className="px-6 py-5">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-bold tracking-tight">{selected.name}</h2>
                    <StatusBadge status={statusMap[selected.status]}>{selected.status}</StatusBadge>
                  </div>
                  <p className="text-[12.5px] text-muted-foreground mt-1.5 max-w-[70ch] leading-relaxed">
                    {selected.description}
                  </p>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm">Duplicate</Button>
                  <Button size="sm">Publish</Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mt-5">
                <Meta icon={Layers3} label="Plans" value={String(selected.plans.length)} />
                <Meta icon={ShieldCheck} label="Rules" value={String(selected.rules.length)} />
                <Meta icon={Globe2} label="Markets" value={String(selected.markets.length)} />
                <Meta icon={GitBranch} label="Version" value={selected.version} />
              </div>

              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  Markets
                </span>
                {selected.markets.map((mc) => {
                  const m = marketByCode(mc);
                  return (
                    <span
                      key={mc}
                      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] text-muted-foreground"
                      title={`${m.regulatorName} · ${m.dataLaw}`}
                    >
                      {m.flag} {m.name}
                      <span className="text-[9.5px] font-bold opacity-70">{m.regulator}</span>
                    </span>
                  );
                })}
                <span className="text-[11px] text-muted-foreground ml-auto">
                  {selected.currency} · owner {selected.owner} · updated {selected.updated}
                </span>
              </div>

              {selected.shariah && (
                <div className="mt-4 rounded-xl border border-success/25 bg-success/[0.05] p-4">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-success">
                    <ShieldCheck className="size-3.5" /> Shariah structure
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-3">
                    <ShariahField label="Model" value={selected.shariah.model} />
                    <ShariahField label="Wakalah fee" value={selected.shariah.wakalahFee ?? "—"} />
                    <ShariahField label="Surplus share" value={selected.shariah.surplusShare ?? "—"} />
                    <ShariahField label="Board approval" value={selected.shariah.approved} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3">
                    Approved by {selected.shariah.board}. Contributions split between the Tabarru&apos;
                    risk fund and the Participant Investment Account; surplus is distributed annually.
                  </p>
                </div>
              )}

              {/* plan tree — the no-code builder view */}
              <h3 className="text-[13.5px] font-bold mt-7 mb-2.5">Plans &amp; benefits</h3>
              <div className="space-y-3">
                {selected.plans.map((plan) => (
                  <div key={plan.name} className="rounded-xl border bg-card overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 border-b bg-secondary/40 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        Plan
                      </span>
                      <span className="text-[13px] font-semibold">{plan.name}</span>
                      <span className="text-[11.5px] text-muted-foreground">{plan.territory}</span>
                      <span className="ml-auto text-[12px] font-semibold tabular-nums">{plan.premium}</span>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2">
                      {plan.benefits.map((b) => (
                        <div key={b.name} className="flex items-center gap-2.5 rounded-lg border px-3 py-2">
                          <span className="w-1 h-6 rounded-full bg-primary shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                              Benefit
                            </div>
                            <div className="text-[12.5px] font-semibold truncate">{b.name}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[12px] font-semibold tabular-nums">{b.limit}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {b.deductible ? `${b.deductible} ded.` : b.waiting ? `${b.waiting} wait` : "—"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-[13.5px] font-bold mt-7 mb-2.5">Underwriting rules</h3>
              <div className="rounded-xl border bg-card divide-y">
                {selected.rules.map((r) => (
                  <div key={r.name} className="flex items-center gap-3 px-4 py-3 flex-wrap">
                    <span className="text-[12.5px] font-semibold w-40 shrink-0">{r.name}</span>
                    <code className="font-mono text-[11.5px] bg-secondary border rounded px-2 py-1 text-muted-foreground flex-1 min-w-0 overflow-x-auto">
                      {r.expression}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

function ShariahField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9.5px] font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-[12px] font-semibold mt-0.5 leading-snug">{value}</div>
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground uppercase tracking-wide">
        <Icon className="size-3" /> {label}
      </div>
      <div className="text-[16px] font-bold mt-1 tabular-nums">{value}</div>
    </div>
  );
}
