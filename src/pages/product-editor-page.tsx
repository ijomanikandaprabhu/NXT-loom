import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useOrg } from "@/lib/org-store";
import { emptyProduct, useProducts, type ProductDraft } from "@/lib/products-store";
import { ProductAssistant } from "@/components/products/product-assistant";
import type { Line, Plan, Product } from "@/data/products";
import { cn } from "@/lib/utils";

const lines: Line[] = ["Health", "Life", "Motor", "Takaful", "Micro"];
const statuses: Product["status"][] = ["Draft", "In review", "Published"];

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border rounded-xl bg-card overflow-hidden">
      <header className="px-5 py-3.5 border-b">
        <h2 className="text-[14px] font-semibold">{title}</h2>
        {note && <p className="text-[11.5px] text-muted-foreground mt-0.5">{note}</p>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function ProductEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const { market, currency } = useI18n();
  const { markets, marketFor } = useOrg();
  const { byId, save, isCustom } = useProducts();

  const existing = id ? byId(id) : undefined;
  // Duplicate hands a pre-filled draft through router state; it is a new product,
  // so it takes the create path rather than editing the product it came from.
  const clone = (useLocation().state as { clone?: ProductDraft } | null)?.clone;
  const [draft, setDraft] = useState<ProductDraft>(
    () => (existing ? structuredClone(existing) : (clone ?? emptyProduct(market, currency)))
  );
  const [touched, setTouched] = useState(false);

  const set = <K extends keyof ProductDraft>(key: K, val: ProductDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: val }));
    setTouched(true);
  };

  const setPlan = (i: number, patch: Partial<Plan>) =>
    set("plans", draft.plans.map((p, pi) => (pi === i ? { ...p, ...patch } : p)));

  // Takaful structure is required for a Takaful product and meaningless otherwise,
  // so the section appears and disappears with the line rather than sitting empty.
  const isTakaful = draft.line === "Takaful";

  const problems = useMemo(() => {
    const out: string[] = [];
    if (!draft.name.trim()) out.push("A product needs a name.");
    if (draft.markets.length === 0) out.push("Select at least one market — a product nobody can sell is not a product.");
    if (draft.plans.length === 0) out.push("Add at least one plan.");
    draft.plans.forEach((p, i) => {
      if (!p.name.trim()) out.push(`Plan ${i + 1} needs a name.`);
      if (p.benefits.length === 0) out.push(`${p.name || `Plan ${i + 1}`} has no benefits — the claim flow would have nothing to adjudicate against.`);
      p.benefits.forEach((b) => {
        if (b.name.trim() && !b.limit.trim()) out.push(`"${b.name}" has no limit set.`);
      });
    });
    if (isTakaful && !draft.shariah?.board?.trim())
      out.push("A Takaful product needs a Shariah board — approval is a required step in the claim flow.");
    if (draft.status === "Published" && out.length === 0 && !draft.description.trim())
      out.push("Add a description before publishing.");
    return out;
  }, [draft, isTakaful]);

  if (!can("product.edit")) {
    return (
      <div className="flex-1 grid place-items-center p-8">
        <div className="max-w-[380px] text-center">
          <p className="text-[14px] font-semibold">You can view products but not change them.</p>
          <p className="text-[12.5px] text-muted-foreground mt-1.5">
            Editing a product changes what every flow adjudicates against, so it needs the
            product.edit grant.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/products")}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const commit = () => {
    const saved = save(draft);
    navigate("/products", { state: { savedId: saved.id } });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 pt-6 pb-20 max-w-[900px] mx-auto w-full flex flex-col gap-5">
        <button
          onClick={() => navigate("/products")}
          className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground cursor-pointer self-start"
        >
          <ChevronLeft className="size-3.5" /> All products
        </button>

        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-bold tracking-tight">
              {existing ? "Edit product" : "New product"}
            </h1>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">
              This definition is what quoting reads and what the claim flow adjudicates
              against. {existing && !isCustom(draft.id) && "Edits layer over the seed product."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/products")}>
              Cancel
            </Button>
            <Button size="sm" disabled={problems.length > 0} onClick={commit}>
              {existing ? "Save changes" : "Create product"}
            </Button>
          </div>
        </div>

        {touched && problems.length > 0 && (
          <div className="rounded-lg border border-warning/40 bg-warning/[0.06] px-4 py-3">
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-warning">
              <TriangleAlert className="size-3.5" />
              {problems.length} thing{problems.length === 1 ? "" : "s"} to fix before saving
            </p>
            <ul className="mt-1.5 space-y-1 text-[12px] text-muted-foreground list-disc pl-5">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {!existing && (
          <ProductAssistant
            market={market}
            currency={currency}
            draftId={draft.id}
            onApply={(d) => {
              setDraft(d);
              setTouched(true);
            }}
          />
        )}

        <Section title="Identity">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name" className="sm:col-span-2">
              <Input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Group Hospital & Surgical" />
            </Field>
            <Field label="Local name" hint="Shown to customers in the local language.">
              <Input value={draft.localName ?? ""} onChange={(e) => set("localName", e.target.value)} placeholder="Perlindungan Kesihatan" />
            </Field>
            <Field label="Owner">
              <Input value={draft.owner} onChange={(e) => set("owner", e.target.value)} placeholder="Product manager" />
            </Field>
            <Field label="Line of business">
              <Select value={draft.line} onValueChange={(v) => set("line", v as Line)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {lines.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={draft.status} onValueChange={(v) => set("status", v as Product["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                className="min-h-[76px]"
                placeholder="What this product covers, how it settles, and anything a reviewer should know."
              />
            </Field>
          </div>
        </Section>

        <Section title="Markets" note="Where this product may be sold. Each market brings its own regulator and currency.">
          <div className="flex flex-wrap gap-2">
            {markets.map((m) => {
              const on = draft.markets.includes(m.code);
              return (
                <button
                  key={m.code}
                  onClick={() =>
                    set("markets", on ? draft.markets.filter((c) => c !== m.code) : [...draft.markets, m.code])
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer",
                    on ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:border-primary/40"
                  )}
                >
                  <span>{m.flag}</span> {m.name}
                  <span className="font-mono text-[10px] opacity-70">{m.currency}</span>
                </button>
              );
            })}
          </div>
          {draft.markets.some((c) => marketFor(c)?.residency === "required") && (
            <p className="mt-3 text-[11.5px] text-destructive">
              One or more selected markets require personal data to stay in-country. Policies sold
              there must be processed in-region.
            </p>
          )}
        </Section>

        {isTakaful && (
          <Section
            title="Shariah structure"
            note="Required for Takaful. Board approval becomes a mandatory node in the claim flow."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Model">
                <Select
                  value={draft.shariah?.model ?? "Wakalah"}
                  onValueChange={(v) =>
                    set("shariah", { ...(draft.shariah ?? { board: "", approved: "" }), model: v as "Wakalah" })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Wakalah", "Mudharabah", "Hybrid"].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Shariah board">
                <Input
                  value={draft.shariah?.board ?? ""}
                  onChange={(e) =>
                    set("shariah", { ...(draft.shariah ?? { model: "Wakalah", approved: "" }), board: e.target.value })
                  }
                  placeholder="Shariah Advisory Committee"
                />
              </Field>
              <Field label="Wakalah fee" hint="Share of contribution retained as an operator fee.">
                <Input
                  value={draft.shariah?.wakalahFee ?? ""}
                  onChange={(e) =>
                    set("shariah", { ...(draft.shariah ?? { model: "Wakalah", board: "", approved: "" }), wakalahFee: e.target.value })
                  }
                  placeholder="30%"
                />
              </Field>
              <Field label="Surplus share" hint="Participant share of the Tabarru' fund surplus.">
                <Input
                  value={draft.shariah?.surplusShare ?? ""}
                  onChange={(e) =>
                    set("shariah", { ...(draft.shariah ?? { model: "Wakalah", board: "", approved: "" }), surplusShare: e.target.value })
                  }
                  placeholder="50% to participants"
                />
              </Field>
            </div>
          </Section>
        )}

        <Section
          title="Plans and benefit schedules"
          note="The benefit schedule is what a claim is adjudicated against — limits, deductibles and waiting periods are read from here."
        >
          <div className="flex flex-col gap-4">
            {draft.plans.map((plan, pi) => (
              <div key={pi} className="rounded-lg border bg-background p-4 flex flex-col gap-3.5">
                <div className="flex items-start gap-3 flex-wrap">
                  <Field label="Plan name" className="flex-1 min-w-[160px]">
                    <Input value={plan.name} onChange={(e) => setPlan(pi, { name: e.target.value })} />
                  </Field>
                  <Field label="Territory" className="flex-1 min-w-[160px]">
                    <Input value={plan.territory} onChange={(e) => setPlan(pi, { territory: e.target.value })} placeholder="Singapore · Malaysia" />
                  </Field>
                  <Field label="Premium" className="flex-1 min-w-[160px]">
                    <Input value={plan.premium} onChange={(e) => setPlan(pi, { premium: e.target.value })} placeholder="S$1,840 / member / yr" />
                  </Field>
                  {draft.plans.length > 1 && (
                    <button
                      onClick={() => set("plans", draft.plans.filter((_, i) => i !== pi))}
                      title="Remove plan"
                      className="mt-6 size-8 shrink-0 rounded-md grid place-items-center text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="border-t pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Benefits
                  </p>
                  <div className="flex flex-col gap-2">
                    {plan.benefits.map((b, bi) => (
                      <div key={bi} className="grid gap-2 sm:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
                        <Input
                          value={b.name}
                          placeholder="Benefit"
                          onChange={(e) =>
                            setPlan(pi, { benefits: plan.benefits.map((x, i) => (i === bi ? { ...x, name: e.target.value } : x)) })
                          }
                        />
                        <Input
                          value={b.limit}
                          placeholder="Limit"
                          onChange={(e) =>
                            setPlan(pi, { benefits: plan.benefits.map((x, i) => (i === bi ? { ...x, limit: e.target.value } : x)) })
                          }
                        />
                        <Input
                          value={b.deductible ?? ""}
                          placeholder="Deductible"
                          onChange={(e) =>
                            setPlan(pi, { benefits: plan.benefits.map((x, i) => (i === bi ? { ...x, deductible: e.target.value } : x)) })
                          }
                        />
                        <Input
                          value={b.waiting ?? ""}
                          placeholder="Waiting period"
                          onChange={(e) =>
                            setPlan(pi, { benefits: plan.benefits.map((x, i) => (i === bi ? { ...x, waiting: e.target.value } : x)) })
                          }
                        />
                        <button
                          onClick={() => setPlan(pi, { benefits: plan.benefits.filter((_, i) => i !== bi) })}
                          title="Remove benefit"
                          className="size-9 shrink-0 rounded-md grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2.5 gap-1.5"
                    onClick={() => setPlan(pi, { benefits: [...plan.benefits, { name: "", limit: "" }] })}
                  >
                    <Plus className="size-3.5" /> Add benefit
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-1.5"
            onClick={() =>
              set("plans", [
                ...draft.plans,
                { name: `Plan ${String.fromCharCode(65 + draft.plans.length)}`, territory: "", premium: "", benefits: [{ name: "", limit: "" }] },
              ])
            }
          >
            <Plus className="size-3.5" /> Add plan
          </Button>
        </Section>

        <Section title="Underwriting rules" note="Evaluated by the flow before a decision is made.">
          <div className="flex flex-col gap-2">
            {draft.rules.map((r, ri) => (
              <div key={ri} className="grid gap-2 sm:grid-cols-[1fr_1.8fr_auto]">
                <Input
                  value={r.name}
                  placeholder="Rule name"
                  onChange={(e) => set("rules", draft.rules.map((x, i) => (i === ri ? { ...x, name: e.target.value } : x)))}
                />
                <Input
                  value={r.expression}
                  placeholder="claim.amount <= plan.limit"
                  className="font-mono text-[12px]"
                  onChange={(e) => set("rules", draft.rules.map((x, i) => (i === ri ? { ...x, expression: e.target.value } : x)))}
                />
                <button
                  onClick={() => set("rules", draft.rules.filter((_, i) => i !== ri))}
                  title="Remove rule"
                  className="size-9 shrink-0 rounded-md grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2.5 gap-1.5"
            onClick={() => set("rules", [...draft.rules, { name: "", expression: "" }])}
          >
            <Plus className="size-3.5" /> Add rule
          </Button>
        </Section>
      </div>
    </div>
  );
}
