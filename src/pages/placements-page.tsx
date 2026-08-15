import { useState } from "react";
import { AlertTriangle, Check, Send, Sparkles, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BindAction } from "@/components/placements/bind-action";
import { usePlacements } from "@/lib/placements-store";
import { NewPlacementDialog } from "@/components/placements/new-placement-dialog";
import { useAuth } from "@/lib/auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge, type Status } from "@/components/shell/status-badge";
import { type QuoteStatus } from "@/data/placements";
import { useMarketData } from "@/lib/market-data";
import { MarketEmpty } from "@/components/shell/market-empty";
import { marketByCode } from "@/data/locale";
import { useI18n } from "@/lib/i18n";
import { useStaggerReveal } from "@/lib/use-stagger-reveal";
import { cn } from "@/lib/utils";

const stageTone: Record<string, Status> = {
  Marketing: "info",
  Comparing: "warning",
  "Awaiting client": "warning",
  Bound: "success",
  Lost: "danger",
};

const quoteTone: Record<QuoteStatus, Status> = {
  Quoted: "success",
  Bound: "success",
  Declined: "danger",
  Pending: "neutral",
  Referred: "warning",
};

const kpiTone = {
  primary: "border-primary/25 bg-primary/[0.05]",
  success: "border-success/25 bg-success/[0.05]",
  warning: "border-warning/25 bg-warning/[0.06]",
  info: "border-info/25 bg-info/[0.05]",
};

export default function PlacementsPage() {
  const { t, money, moneyCompact } = useI18n();
  const { placements, placementKpis } = useMarketData();
  const { chase, eventsFor } = usePlacements();
  const { external } = useAuth();
  const [newOpen, setNewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = placements.find((p) => p.id === selectedId) ?? placements[0];
  const listRef = useStaggerReveal<HTMLDivElement>([]);

  const priced = selected?.quotes.filter((q) => q.premium) ?? [];
  const best = priced.length ? Math.min(...priced.map((q) => q.premium!)) : 0;
  const clean = priced.find((q) => q.deviations[0] === "Matches slip");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-3 border-b px-6 py-4 shrink-0 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight">{t("placements.title")}</h1>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            {external
              ? `Submissions placed by ${external.firm}. You see only your own — never the insurer's wider book.`
              : t("placements.subtitle")}
          </p>
        </div>
        <Button size="sm" className="ml-auto gap-1.5" onClick={() => setNewOpen(true)}>
          <Send className="size-3.5" /> {t("placements.new")}
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-3 px-6 py-4 border-b shrink-0">
        {placementKpis.map((k) => (
          <div key={k.l} className={cn("rounded-xl border p-3.5", kpiTone[k.tone])}>
            <div className="text-[21px] font-bold tracking-tight tabular-nums">{k.n}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{t(k.l)}</div>
          </div>
        ))}
      </div>

      {placements.length === 0 ? (
        <div className="p-6"><MarketEmpty what="placements" action={t("placements.new")} /></div>
      ) : (
      <div className="grid grid-cols-[320px_1fr] flex-1 min-h-0">
        <ScrollArea className="border-r min-h-0">
          <div ref={listRef}>
            {placements.map((p) => {
              const m = marketByCode(p.market);
              return (
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
                    <span className="font-mono text-[10.5px] text-muted-foreground">{p.id}</span>
                    <span className="text-[11px]">{m.flag} {m.code}</span>
                    <StatusBadge status={stageTone[p.stage]}>{p.stage}</StatusBadge>
                  </div>
                  <div className="text-[13px] font-semibold mt-1.5 truncate">{p.client}</div>
                  <div className="text-[11.5px] text-muted-foreground truncate">{p.line}</div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10.5px] text-muted-foreground">
                    <span className="tabular-nums">{moneyCompact(p.sumInsured, p.currency)} SI</span>
                    <span>·</span>
                    <span>{p.carriersApproached} carriers</span>
                    <span className="ml-auto">{p.daysOpen}d open</span>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <ScrollArea className="min-h-0">
          {selected && (
          <div className="px-6 py-5">
            <div className="flex items-start gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[18px] font-bold tracking-tight">{selected.client}</h2>
                  <StatusBadge status={stageTone[selected.stage]}>{selected.stage}</StatusBadge>
                </div>
                <p className="text-[12.5px] text-muted-foreground mt-1">
                  {selected.line} · inception {selected.inception} · handler {selected.handler}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selected.quotes.every((q) => q.status !== "Pending")}
                  onClick={() => chase(selected.id)}
                >
                  Chase carriers
                </Button>
              </div>
            </div>

            {/* AI summary — the broker-value moment */}
            <div className="mt-4 rounded-xl border border-primary/25 bg-primary/[0.05] p-4">
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-primary">
                <Sparkles className="size-3.5" /> Placement summary
              </div>
              <p className="text-[12.5px] text-muted-foreground mt-2 leading-relaxed max-w-[76ch]">
                {selected.summary}
              </p>
              {priced.length > 1 && clean && clean.premium! > best ? (
                <div className="flex items-center gap-2 mt-3 text-[11.5px] flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-warning/15 text-warning px-2 py-1 font-semibold">
                    <AlertTriangle className="size-3" />
                    Cheapest is not cleanest
                  </span>
                  <span className="text-muted-foreground">
                    {money(clean.premium! - best, selected.currency)} more buys terms that match the
                    slip exactly.
                  </span>
                </div>
              ) : priced.length > 1 && clean ? (
                <div className="flex items-center gap-2 mt-3 text-[11.5px] flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-success/15 text-success px-2 py-1 font-semibold">
                    <Check className="size-3" />
                    Cheapest also matches the slip
                  </span>
                  <span className="text-muted-foreground">
                    No trade-off between price and terms on this placement.
                  </span>
                </div>
              ) : null}
            </div>

            {/* carrier comparison */}
            <h3 className="text-[13.5px] font-bold mt-6 mb-2.5">
              Carrier responses
              <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                {selected.quotes.filter((q) => q.premium).length} quoted ·{" "}
                {selected.quotes.filter((q) => q.status === "Pending").length} pending
              </span>
            </h3>

            <div className="space-y-2.5">
              {selected.quotes.map((q) => {
                const isBest = q.premium === best && best > 0;
                const isClean = q.deviations[0] === "Matches slip";
                return (
                  <div
                    key={q.carrier}
                    className={cn(
                      "rounded-xl border bg-card p-4",
                      q.status === "Bound" && "border-success/40 bg-success/[0.04]"
                    )}
                  >
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[13px] font-semibold">{q.carrier}</span>
                      <StatusBadge status={quoteTone[q.status]}>{q.status}</StatusBadge>
                      {isBest && (
                        <span className="inline-flex items-center gap-1 rounded bg-info/15 text-info px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                          <TrendingDown className="size-3" /> Lowest
                        </span>
                      )}
                      {isClean && (
                        <span className="inline-flex items-center gap-1 rounded bg-success/15 text-success px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                          <Check className="size-3" /> Matches slip
                        </span>
                      )}
                      {q.premium && (
                        <span className="ml-auto text-[15px] font-bold tabular-nums">
                          {money(q.premium, selected.currency)}
                        </span>
                      )}
                    </div>

                    {q.commission !== undefined && (
                      <div className="text-[11px] text-muted-foreground mt-1">
                        Commission {q.commission}% · received {q.received}
                      </div>
                    )}
                    {q.note && (
                      <p className="text-[11.5px] text-muted-foreground mt-1.5">{q.note}</p>
                    )}

                    {q.deviations.length > 0 && !isClean && (
                      <div className="mt-2.5 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-warning">
                          Deviations from slip
                        </div>
                        {q.deviations.map((d) => (
                          <div
                            key={d}
                            className="flex items-start gap-1.5 text-[11.5px] text-muted-foreground"
                          >
                            <AlertTriangle className="size-3 text-warning shrink-0 mt-0.5" />
                            {d}
                          </div>
                        ))}
                      </div>
                    )}

                    <BindAction placement={selected} quote={q} />
                  </div>
                );
              })}
            </div>

            {eventsFor(selected.id).length > 0 && (
              <>
                <h3 className="text-[13.5px] font-bold mt-6 mb-2.5">Activity</h3>
                <ol className="space-y-1.5">
                  {eventsFor(selected.id).map((e, i) => (
                    <li key={i} className="text-[11.5px] text-muted-foreground">
                      <span className="font-semibold text-foreground">{e.actorName}</span>{" "}
                      {e.action === "bound" && <>bound with {e.carrier}</>}
                      {e.action === "referred" && <>referred {e.carrier} for approval</>}
                      {e.action === "chased" && <>chased carriers — {e.note}</>}
                      <span className="ml-1.5 font-mono text-[10px]">
                        {new Date(e.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                      {e.action === "referred" && e.note && (
                        <p className="mt-0.5 border-l-2 border-border pl-2">{e.note}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
          )}
        </ScrollArea>
      </div>
      )}
      <NewPlacementDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}
