import { useState } from "react";
import { Check, CircleHelp, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { draftFromDescription, exampleDescriptions, type Inference } from "@/lib/product-assistant";
import type { ProductDraft } from "@/lib/products-store";
import type { MarketCode } from "@/data/locale";
import { cn } from "@/lib/utils";

/**
 * Describe a product; get an editable draft.
 *
 * The result is deliberately shown as a list of inferences split into what was
 * stated and what was assumed. A generator that quietly invents a benefit limit
 * costs more than a blank form, because the error is now buried in something
 * that looks finished.
 */
export function ProductAssistant({
  market,
  currency,
  draftId,
  onApply,
}: {
  market: MarketCode;
  currency: string;
  draftId: string;
  onApply: (d: ProductDraft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ draft: ProductDraft; inferences: Inference[] } | null>(null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 rounded-xl border border-dashed border-primary/40 bg-primary/[0.04] px-4 py-3 text-left transition-colors hover:bg-primary/[0.07] cursor-pointer"
      >
        <Sparkles className="size-4 text-primary shrink-0" />
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-semibold">Describe it instead</span>
          <span className="block text-[11.5px] text-muted-foreground">
            Say what the product covers and this fills the plans, benefits and rules for you.
          </span>
        </span>
      </button>
    );
  }

  return (
    <section className="border border-primary/40 rounded-xl bg-primary/[0.03] overflow-hidden">
      <header className="px-5 py-3.5 border-b border-primary/20 flex items-center gap-2">
        <Sparkles className="size-4 text-primary shrink-0" />
        <h2 className="text-[14px] font-semibold flex-1">Describe the product</h2>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Close
        </Button>
      </header>

      <div className="p-5 flex flex-col gap-3">
        <Textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[84px] text-[13px] bg-background"
          placeholder="Family Takaful medical plan for Malaysia with RM 300,000 critical illness cover and a 60 day waiting period"
        />

        {!result && (
          <div className="flex flex-wrap gap-1.5">
            {exampleDescriptions.map((e) => (
              <button
                key={e}
                onClick={() => setText(e)}
                className="text-left text-[11px] rounded-full border bg-card px-2.5 py-1 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors cursor-pointer max-w-full truncate"
              >
                {e.length > 58 ? `${e.slice(0, 58)}…` : e}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5"
            disabled={text.trim().length < 10}
            onClick={() => setResult(draftFromDescription(text, market, currency, draftId))}
          >
            <Wand2 className="size-3.5" /> {result ? "Regenerate" : "Generate draft"}
          </Button>
          {text.trim().length > 0 && text.trim().length < 10 && (
            <span className="text-[11px] text-muted-foreground">
              A sentence or two works best.
            </span>
          )}
        </div>

        {result && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-[12px] font-semibold mb-2.5">
              What this filled in — check the assumptions before you save.
            </p>
            <ul className="space-y-1.5">
              {result.inferences.map((inf, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px]">
                  {inf.source === "stated" ? (
                    <Check className="size-3.5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <CircleHelp className="size-3.5 text-warning shrink-0 mt-0.5" />
                  )}
                  <span className="min-w-0">
                    <span className="font-medium">{inf.field}</span>
                    <span className="text-muted-foreground"> — {inf.value}</span>
                    <span
                      className={cn(
                        "ml-1.5 text-[9.5px] font-bold uppercase tracking-wide rounded px-1",
                        inf.source === "stated"
                          ? "bg-success/12 text-success"
                          : "bg-warning/15 text-warning"
                      )}
                    >
                      {inf.source === "stated" ? "from you" : "assumed"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t">
              <Button
                size="sm"
                onClick={() => {
                  onApply(result.draft);
                  setOpen(false);
                  setResult(null);
                  setText("");
                }}
              >
                Use this draft
              </Button>
              <span className="text-[11px] text-muted-foreground">
                Everything stays editable below.
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
