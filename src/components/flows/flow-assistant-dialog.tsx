import { useState } from "react";
import { Info, Sparkles, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { exampleFlows, proposeFlow, type FlowProposal, type FlowStepKind } from "@/lib/flow-assistant";
import { useI18n } from "@/lib/i18n";
import { useOrg } from "@/lib/org-store";
import { cn } from "@/lib/utils";

const kindTone: Record<FlowStepKind, string> = {
  intake: "bg-info/15 text-info",
  ocr: "bg-primary/15 text-primary",
  extract: "bg-primary/15 text-primary",
  switch: "bg-warning/15 text-warning",
  rule: "bg-secondary text-secondary-foreground",
  review: "bg-warning/15 text-warning",
  action: "bg-success/15 text-success",
};

/**
 * Describe a process; get a proposed flow outline.
 *
 * Every step states why it is there, so the outline can be argued with rather
 * than accepted. It stops at a proposal — a generated flow that reached
 * production unreviewed is the exact failure this product exists to prevent.
 */
export function FlowAssistantDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { market } = useI18n();
  const { marketFor } = useOrg();
  const [text, setText] = useState("");
  const [proposal, setProposal] = useState<FlowProposal | null>(null);

  const info = marketFor(market);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Build with an agent
          </DialogTitle>
          <DialogDescription>
            Describe the process in your own words. Every step it proposes explains why
            it is there.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[86px] text-[13px]"
          placeholder="Health claim from WhatsApp with hospital bill photos, check the benefit schedule, settle anything clean under RM 5,000"
        />

        {!proposal && (
          <div className="flex flex-col gap-1">
            {exampleFlows.map((e) => (
              <button
                key={e}
                onClick={() => setText(e)}
                className="text-left text-[11.5px] rounded-md border bg-card px-2.5 py-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors cursor-pointer"
              >
                {e}
              </button>
            ))}
          </div>
        )}

        <div>
          <Button
            size="sm"
            className="gap-1.5"
            disabled={text.trim().length < 12}
            onClick={() => setProposal(proposeFlow(text, market, Boolean(info?.takaful)))}
          >
            <Wand2 className="size-3.5" /> {proposal ? "Regenerate" : "Propose a flow"}
          </Button>
        </div>

        {proposal && (
          <div className="max-h-[46vh] overflow-y-auto rounded-lg border bg-card p-4">
            <p className="text-[13px] font-semibold mb-3">{proposal.title}</p>
            <ol className="space-y-2.5">
              {proposal.steps.map((s, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-[10px] font-mono text-muted-foreground pt-1 w-4 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12.5px] font-semibold">{s.name}</span>
                      <span
                        className={cn(
                          "text-[9.5px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5",
                          kindTone[s.kind]
                        )}
                      >
                        {s.kind}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-muted-foreground">{s.detail}</p>
                    <p className="text-[11px] text-muted-foreground/80 italic mt-0.5">{s.because}</p>
                  </div>
                </li>
              ))}
            </ol>

            {proposal.notes.length > 0 && (
              <div className="mt-4 pt-3 border-t space-y-1.5">
                {proposal.notes.map((n) => (
                  <p key={n} className="flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
                    <Info className="size-3.5 shrink-0 mt-0.5" />
                    {n}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
