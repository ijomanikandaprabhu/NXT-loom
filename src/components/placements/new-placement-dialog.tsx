import { useMemo, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePlacements } from "@/lib/placements-store";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { placements as seedPlacements, type Placement } from "@/data/placements";
import { cn } from "@/lib/utils";

/** Carriers already seen in this market — a broker markets to who is actually there. */
function carriersFor(market: string) {
  const set = new Set<string>();
  for (const p of seedPlacements) {
    if (p.market === market) p.quotes.forEach((q) => set.add(q.carrier));
  }
  return Array.from(set);
}

/** Reads a slip description the way a broker would say it out loud. */
function parseRisk(text: string) {
  const out: { client?: string; line?: string; sumInsured?: number; summary: string } = {
    summary: text.trim(),
  };

  const first = text.split(/[,.\n]/)[0].trim();
  if (first.length > 2) out.client = first;

  const line = [
    [/motor|fleet|vehicle/i, "Motor Fleet"],
    [/property|fire|warehouse|building/i, "Property All Risks"],
    [/marine|cargo|freight/i, "Marine Cargo"],
    [/liability|public|product/i, "Liability"],
    [/health|medical|group/i, "Group Medical"],
    [/engineering|contractor|erection/i, "Engineering"],
  ].find(([re]) => (re as RegExp).test(text));
  if (line) out.line = line[1] as string;

  // "Rp 48 billion", "RM 12juta", "S$3.5m" — the ways people actually write it.
  //
  // A number needs a currency mark or a scale word to count. Without that rule
  // "fleet of 180 units" reads as a sum insured of 180, which is both wrong and
  // the kind of wrong that looks filled in.
  const mult: Record<string, number> = {
    billion: 1e9, bn: 1e9, "tỷ": 1e9,
    million: 1e6, m: 1e6, juta: 1e6, jt: 1e6, "triệu": 1e6,
    ribu: 1e3, k: 1e3,
  };
  const SCALE = "billion|bn|million|m|juta|jt|ribu|tỷ|triệu|k";
  const candidates = [
    ...text.matchAll(new RegExp(String.raw`(?:RM|S\$|Rp|฿|₫|₱)\s?([\d.,]+)\s?(${SCALE})?`, "gi")),
    ...text.matchAll(new RegExp(String.raw`([\d.,]+)\s?(${SCALE})\b`, "gi")),
  ]
    .map((m) => {
      const n = Number(m[1].replace(/,/g, ""));
      return Number.isNaN(n) ? 0 : n * (mult[(m[2] ?? "").toLowerCase()] ?? 1);
    })
    .filter((n) => n > 0);

  // A slip usually names one big number and several small ones; the sum insured
  // is the big one.
  if (candidates.length) out.sumInsured = Math.max(...candidates);
  return out;
}

export function NewPlacementDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { add } = usePlacements();
  const { user, external } = useAuth();
  const { market, currency, money } = useI18n();

  const available = useMemo(() => carriersFor(market), [market]);
  const [describe, setDescribe] = useState("");
  const [client, setClient] = useState("");
  const [line, setLine] = useState("");
  const [sumInsured, setSumInsured] = useState("");
  const [inception, setInception] = useState("");
  const [summary, setSummary] = useState("");
  const [carriers, setCarriers] = useState<string[]>([]);

  const reset = () => {
    setDescribe(""); setClient(""); setLine(""); setSumInsured("");
    setInception(""); setSummary(""); setCarriers([]);
  };

  const problems: string[] = [];
  if (!client.trim()) problems.push("Client name");
  if (!line.trim()) problems.push("Line of business");
  if (carriers.length === 0) problems.push("At least one carrier to approach");

  const submit = () => {
    const p: Placement = {
      id: `PLC-${Math.floor(1000 + Math.random() * 8999)}`,
      client: client.trim(),
      line: line.trim(),
      market,
      currency: currency as Placement["currency"],
      sumInsured: Number(sumInsured.replace(/[^\d]/g, "")) || 0,
      inception: inception.trim() || "—",
      stage: "Marketing",
      handler: external?.handle ?? user?.name ?? "",
      carriersApproached: carriers.length,
      daysOpen: 0,
      summary: summary.trim() || describe.trim(),
      // Fanning out is the point: one submission, every carrier at once.
      quotes: carriers.map((c) => ({
        carrier: c,
        status: "Pending" as const,
        deviations: [],
        note: "Slip issued — awaiting response",
      })),
    };
    add(p);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>New placement</DialogTitle>
          <DialogDescription>
            Enter the risk once. It goes to every carrier you pick at the same time.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto flex flex-col gap-4 pr-1">
          <div className="rounded-lg border border-primary/40 bg-primary/[0.04] p-3.5 flex flex-col gap-2.5">
            <label className="flex items-center gap-1.5 text-[12px] font-semibold">
              <Sparkles className="size-3.5 text-primary" /> Describe the risk
            </label>
            <Textarea
              value={describe}
              onChange={(e) => setDescribe(e.target.value)}
              className="min-h-[62px] text-[12.5px] bg-background"
              placeholder="PT Sinar Mas Logistik, motor fleet of 240 units across Java, Rp 48 billion sum insured"
            />
            <div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={describe.trim().length < 8}
                onClick={() => {
                  const r = parseRisk(describe);
                  if (r.client) setClient(r.client);
                  if (r.line) setLine(r.line);
                  if (r.sumInsured) setSumInsured(String(r.sumInsured));
                  setSummary(r.summary);
                }}
              >
                <Wand2 className="size-3.5" /> Fill the form
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Client</span>
              <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="PT Sinar Mas Logistik" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Line of business</span>
              <Input value={line} onChange={(e) => setLine(e.target.value)} placeholder="Motor Fleet" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sum insured</span>
              <Input
                value={sumInsured}
                onChange={(e) => setSumInsured(e.target.value)}
                placeholder="48000000000"
                className="tabular-nums"
              />
              {Number(sumInsured) > 0 && (
                <span className="text-[11px] text-muted-foreground">{money(Number(sumInsured))}</span>
              )}
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Inception</span>
              <Input value={inception} onChange={(e) => setInception(e.target.value)} placeholder="01/07/2026" />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Slip summary</span>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[60px] text-[12.5px]"
              placeholder="What the carriers need to know about this risk."
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Carriers to approach
            </span>
            {available.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">
                No carriers on record in this market yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {available.map((c) => {
                  const on = carriers.includes(c);
                  return (
                    <button
                      key={c}
                      // Functional update, not a closure over `carriers`: several
                      // toggles in one tick would otherwise batch against the same
                      // stale array and only the last would survive.
                      onClick={() =>
                        setCarriers((prev) =>
                          prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer",
                        on ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            )}
            {carriers.length > 0 && (
              <p className="text-[11.5px] text-muted-foreground">
                One slip, {carriers.length} {carriers.length === 1 ? "carrier" : "carriers"} — sent together, not one after another.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col items-stretch sm:flex-row sm:items-center gap-2">
          {problems.length > 0 && (
            <span className="text-[11.5px] text-muted-foreground sm:mr-auto">
              Still needed: {problems.join(" · ")}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={problems.length > 0} onClick={submit}>
            Issue slip to {carriers.length || "…"} {carriers.length === 1 ? "carrier" : "carriers"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
