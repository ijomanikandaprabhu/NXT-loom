import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Coins,
  Timer,
  UserCheck,
  FileText,
  Search,
  ChevronsUpDown,
  AlertTriangle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StatusBadge, type Status } from "@/components/shell/status-badge";
import { useItems } from "@/lib/items-store";
import { ReviewActions } from "@/components/items/review-actions";
import { ActivityTrail } from "@/components/items/activity-trail";
import { itemDetails, genericDetail, type ItemDetail } from "@/data/item-details";
import { cn } from "@/lib/utils";

const statusMap: Record<string, Status> = {
  "Requires Review": "danger",
  "In Review": "info",
  Completed: "success",
};

const insightIcon = { success: ShieldCheck, primary: Coins, warning: Timer, info: UserCheck };
const insightTone = {
  success: "bg-success/15 text-success",
  primary: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
};

export default function ItemDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { items } = useItems();
  const item = items.find((w) => w.id === id);
  const [tab, setTab] = useState<"insights" | "review">("insights");

  const detail: ItemDetail | null = useMemo(() => {
    if (!item) return null;
    return (
      itemDetails[item.id] ??
      genericDetail(item.id, item.title, item.summary, item.type, item.market)
    );
  }, [item]);

  if (!item || !detail) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Item not found.
        <Link to="/items" className="text-primary ml-1">Back to Items</Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 pt-6 pb-16 max-w-[1140px] mx-auto w-full">
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <button onClick={() => navigate("/items")} className="hover:text-foreground cursor-pointer">Workspaces</button>
          <ChevronRight className="size-3" />
          <span>{detail.breadcrumb}</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium">{item.id.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <h1 className="text-[22px] font-bold tracking-tight">{item.id.toUpperCase()}</h1>
          <StatusBadge status={statusMap[item.status]}>{item.status}</StatusBadge>
          {tab === "review" && (
            <div className="flex items-center gap-2 min-w-[180px]">
              <Progress value={detail.completion} className="w-28 h-1.5" indicatorClassName="bg-primary" />
              <span className="text-[11.5px] font-semibold text-muted-foreground">{detail.completion}% complete</span>
            </div>
          )}
          <div className="ml-auto">
            <ReviewActions item={item} />
          </div>
        </div>

        <section className="mt-5 rounded-lg border bg-card p-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Decision history
          </h2>
          <ActivityTrail itemId={item.id} />
        </section>

        <div className="grid grid-cols-2 border rounded-lg overflow-hidden mt-5 max-w-[560px]">
          {(["insights", "review"] as const).map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-8 py-2.5 text-[13px] font-semibold capitalize transition-colors cursor-pointer",
                tab === t ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary",
                i === 1 && "border-l"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "insights" ? <InsightsTab detail={detail} /> : <ReviewTab detail={detail} />}
      </div>
    </div>
  );
}

function InsightsTab({ detail }: { detail: ItemDetail }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-5 mt-5">
      <div className="min-w-0">
        <div className={cn("relative rounded-xl p-5 text-white bg-gradient-to-br overflow-hidden", detail.banner)}>
          <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full border border-white/10" />
          <div aria-hidden className="absolute -right-4 top-16 size-28 rounded-full border border-white/10" />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide opacity-90">
              <AlertTriangle className="size-3.5" /> {detail.bannerEyebrow}
            </div>
            <h2 className="text-[18px] font-bold mt-2 leading-snug text-balance">{detail.bannerTitle}</h2>
            <p className="text-[12.5px] opacity-90 mt-2.5 leading-relaxed max-w-[62ch]">{detail.bannerBody}</p>
          </div>
        </div>

        <h3 className="text-[13.5px] font-bold mt-6 mb-2.5 flex items-center gap-2">
          <Sparkles className="size-3.5 text-primary" /> Key Insights
        </h3>
        <Accordion type="single" collapsible defaultValue="i0" className="rounded-lg overflow-hidden border bg-card">
          {detail.keyInsights.map((ins, i) => {
            const Icon = insightIcon[ins.tone];
            return (
              <AccordionItem key={i} value={`i${i}`} className="px-4">
                <AccordionTrigger className="text-[12.5px] font-semibold py-3 hover:no-underline cursor-pointer">
                  <span className="flex items-center gap-2.5 text-left">
                    <span className={cn("size-6 rounded-md flex items-center justify-center shrink-0", insightTone[ins.tone])}>
                      <Icon className="size-3.5" />
                    </span>
                    {ins.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-[12px] text-muted-foreground pl-[2.15rem]">
                  {ins.detail}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {detail.narratives.map((n) => (
          <div key={n.heading}>
            <h3 className="text-[13.5px] font-bold mt-6 mb-2.5 flex items-center gap-2">
              <FileText className="size-3.5 text-muted-foreground" /> {n.heading}
            </h3>
            <div className="rounded-xl border bg-secondary/40 p-4 space-y-4">
              {n.sections.map((s) => (
                <div key={s.eyebrow}>
                  <p className="text-[10.5px] font-bold text-primary uppercase tracking-wide mb-1.5">{s.eyebrow}</p>
                  <p className="text-[12.5px] leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-start justify-between">
            <span className="size-8 rounded-full bg-primary/15 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </span>
            <div className="text-right">
              <div className="text-[10.5px] text-muted-foreground font-semibold tracking-wide">CONFIDENCE</div>
              <div className="text-[18px] font-bold text-success tabular-nums">{detail.confidence}%</div>
            </div>
          </div>
          <p className="text-[10.5px] text-muted-foreground uppercase tracking-wide font-semibold mt-3">AI Recommendation</p>
          <h4 className="text-[13.5px] font-bold mt-0.5 leading-snug">{detail.recommendationTitle}</h4>
          <p className="text-[11.5px] text-muted-foreground mt-2 leading-relaxed">{detail.recommendationBody}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 grid grid-cols-3 gap-2 text-center">
          {detail.stats.map((s) => (
            <div key={s.label}>
              <div className={cn("text-[15px] font-bold tabular-nums", s.accent && "text-warning")}>
                {s.accent ? (
                  <span className="inline-flex size-7 items-center justify-center rounded-full border-2 border-warning/40 text-[12px]">
                    {s.value}
                  </span>
                ) : (
                  s.value
                )}
              </div>
              <div className="text-[9.5px] text-muted-foreground uppercase tracking-wide mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wide">Source Documents</h4>
            <span className="text-[11px] text-muted-foreground">{detail.sourceDocs.length}</span>
          </div>
          <div className="rounded-xl border bg-card divide-y">
            {detail.sourceDocs.map((d) => (
              <button key={d.name} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-secondary transition-colors cursor-pointer">
                <span className="text-[8px] font-bold text-muted-foreground border rounded px-1 py-0.5 shrink-0 w-8 text-center">
                  {d.ext}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11.5px] font-medium truncate">{d.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{d.kind} · {d.size}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Audit Trail</h4>
          <div className="rounded-xl border bg-card p-3.5">
            {detail.audit.map((a, i) => (
              <div key={i} className="flex gap-2.5 pb-3 last:pb-0">
                <div className="flex flex-col items-center shrink-0">
                  <span className={cn("size-2.5 rounded-full border-2", a.active ? "border-primary bg-background" : "border-transparent bg-primary/40")} />
                  {i < detail.audit.length - 1 && <span className="flex-1 w-px bg-border mt-1" />}
                </div>
                <div className="min-w-0 -mt-0.5">
                  <div className="text-[10px] text-warning font-semibold">{a.date}</div>
                  <div className={cn("text-[11.5px] leading-snug", a.active ? "font-semibold uppercase tracking-wide" : "text-muted-foreground")}>
                    {a.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewTab({ detail }: { detail: ItemDetail }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "data" | "review" | "empty">("all");

  const totals = useMemo(() => {
    const all = detail.groups.flatMap((g) => g.fields);
    return {
      all: all.length,
      data: all.filter((f) => f.value).length,
      review: all.filter((f) => f.status === "verify").length,
      empty: all.filter((f) => !f.value).length,
    };
  }, [detail]);

  const groups = detail.groups
    .map((g) => ({
      ...g,
      fields: g.fields.filter((f) => {
        if (filter === "review" && f.status !== "verify") return false;
        if (filter === "data" && !f.value) return false;
        if (filter === "empty" && f.value) return false;
        if (query && !`${f.label} ${f.value}`.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    }))
    .filter((g) => g.fields.length > 0);

  const chips = [
    { k: "all" as const, label: "All Fields", n: totals.all },
    { k: "data" as const, label: "With Data", n: totals.data },
    { k: "review" as const, label: "Needs Review", n: totals.review },
    { k: "empty" as const, label: "Empty", n: totals.empty },
  ];

  return (
    <div className="mt-5">
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fields"
            className="pl-8 h-9 text-[12.5px]"
          />
        </div>
        <Button variant="outline" size="sm" className="ml-auto gap-1.5">
          <ChevronsUpDown className="size-3.5" /> Expand All Groups
        </Button>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {chips.map((c) => (
          <button
            key={c.k}
            onClick={() => setFilter(c.k)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer",
              filter === c.k ? "bg-accent text-accent-foreground border-primary/30 font-semibold" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            {c.label}
            <span className={cn("text-[10.5px] font-bold rounded px-1", filter === c.k ? "bg-primary/15" : "bg-secondary")}>
              {c.n}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wide">Filter by source</p>
        <div className="flex items-center gap-2 flex-wrap">
          {detail.sourceDocs.slice(0, 3).map((d, i) => (
            <span key={d.name} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              {d.name.replace(/\.[a-z]+$/, "").replace(/_/g, " ")}
              <span className="text-[10.5px] opacity-70">({[14, 16, 0][i]})</span>
            </span>
          ))}
          {detail.sourceDocs.length > 3 && (
            <span className="rounded-full border px-2.5 py-1 text-[11.5px] text-muted-foreground">
              +{detail.sourceDocs.length - 3}
            </span>
          )}
        </div>
      </div>

      {groups.length === 0 && (
        <div className="mt-6 border rounded-xl bg-card p-14 flex flex-col items-center text-center">
          <span className="size-11 rounded-full bg-accent flex items-center justify-center mb-4">
            <Search className="size-5 text-accent-foreground" />
          </span>
          <p className="text-[14px] font-semibold">
            {query ? "No fields match your search" : `No fields in "${chips.find((c) => c.k === filter)?.label}"`}
          </p>
          <p className="text-[12.5px] text-muted-foreground mt-1.5 max-w-[340px]">
            {query
              ? `Nothing on this item matches "${query}". Clear the search to see all ${totals.all} fields.`
              : filter === "empty"
                ? "Every field on this item was extracted with a value — nothing is blank."
                : "Try a different filter to see the fields on this item."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Show all fields
          </Button>
        </div>
      )}

      <div className="mt-6 space-y-5">
        {groups.map((g) => (
          <div key={g.name}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <h3 className="text-[13px] font-bold">{g.name}</h3>
              {g.warnings ? (
                <span className="inline-flex items-center justify-center size-4 rounded-full bg-warning/20 text-warning text-[10px] font-bold">
                  {g.warnings}
                </span>
              ) : null}
              <span className="ml-auto flex items-center gap-2 shrink-0">
                <Progress
                  value={(g.filled / g.total) * 100}
                  className="w-14 h-1.5"
                  indicatorClassName={g.filled === g.total ? "bg-success" : "bg-warning"}
                />
                <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">{g.filled}/{g.total}</span>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {g.fields.map((f, i) => (
                <div
                  key={`${f.label}-${i}`}
                  className={cn(
                    "rounded-lg border bg-card p-3.5",
                    f.status === "verify" && "border-warning/35 bg-warning/[0.04]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{f.label}</span>
                    <span className={cn("size-1.5 rounded-full shrink-0 mt-1", f.status === "verify" ? "bg-warning" : "bg-success")} />
                  </div>
                  <div className="text-[13.5px] font-semibold mt-1 break-words">{f.value}</div>
                  {f.note && <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{f.note}</p>}
                  {f.status === "verify" && (
                    <span className="inline-block mt-2 text-[9.5px] font-bold uppercase tracking-wide text-warning bg-warning/15 rounded px-1.5 py-0.5">
                      Verify — may be incomplete
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                    {f.docRefs.map((r) => (
                      <span key={r} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground border rounded px-1.5 py-0.5">
                        <FileText className="size-2.5" /> Doc ref {r}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    {["Confirm", "Correct", "Mark missing", "Flag"].map((a) => (
                      <button
                        key={a}
                        className="text-[10.5px] px-2 py-1 rounded border hover:bg-secondary transition-colors cursor-pointer"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 mt-8 border-t pt-4">
        <Button variant="outline" size="sm">Cancel</Button>
        <Button size="sm" className="gap-1.5"><Send className="size-3.5" /> Submit</Button>
      </div>
    </div>
  );
}
