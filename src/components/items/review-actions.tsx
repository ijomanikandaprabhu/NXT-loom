import { useState } from "react";
import { AlertTriangle, Check, Lock, Undo2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useItems } from "@/lib/items-store";
import type { WorkItem } from "@/data/work-items";
import { cn } from "@/lib/utils";

/**
 * Decision bar for a work item.
 *
 * Rejecting and escalating demand a reason; approving does not. That asymmetry
 * is deliberate — agreeing with the flow needs no explanation, and disagreeing
 * with it is exactly what a reviewer of the automation needs to read later.
 */
export function ReviewActions({ item }: { item: WorkItem }) {
  const { user, can } = useAuth();
  const { decide, outcomeFor } = useItems();
  const [pending, setPending] = useState<"reject" | "escalate" | null>(null);
  const [note, setNote] = useState("");

  const mayReview = can("item.review");
  const done = item.status === "Completed";
  const outcome = outcomeFor(item.id);
  const mine = item.reviewer === user?.name;

  if (!mayReview) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-secondary/40 px-3.5 py-2.5 text-[12px] text-muted-foreground">
        <Lock className="size-3.5 shrink-0" />
        Your role can view this item but not decide it.
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold",
            outcome === "rejected"
              ? "bg-destructive/10 text-destructive"
              : "bg-success/10 text-success"
          )}
        >
          {outcome === "rejected" ? <X className="size-3.5" /> : <Check className="size-3.5" />}
          {outcome === "rejected" ? "Rejected" : "Approved"} by {item.reviewer}
        </span>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => decide(item.id, "reopen")}>
          <Undo2 className="size-3.5" /> Reopen
        </Button>
      </div>
    );
  }

  if (pending) {
    const label = pending === "reject" ? "Reject" : "Escalate";
    return (
      <div className="rounded-lg border bg-card p-3.5 flex flex-col gap-2.5">
        <label htmlFor="review-note" className="text-[12px] font-semibold">
          Why are you {pending === "reject" ? "rejecting" : "escalating"} this?
        </label>
        <Textarea
          id="review-note"
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            pending === "reject"
              ? "e.g. Procedure excluded under the policy's 12-month waiting period"
              : "e.g. Billed amount exceeds my authority — needs senior underwriter"
          }
          className="min-h-[74px] text-[12.5px]"
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={pending === "reject" ? "destructive" : "default"}
            disabled={note.trim().length < 4}
            onClick={() => {
              decide(item.id, pending, note.trim());
              setNote("");
              setPending(null);
            }}
          >
            Confirm {label.toLowerCase()}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setPending(null); setNote(""); }}>
            Cancel
          </Button>
          {note.trim().length < 4 && (
            <span className="text-[11px] text-muted-foreground">A reason is required.</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!mine && (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => decide(item.id, "claim")}>
          <UserPlus className="size-3.5" /> Assign to me
        </Button>
      )}
      <Button size="sm" className="gap-1.5" onClick={() => decide(item.id, "approve")}>
        <Check className="size-3.5" /> Approve
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPending("reject")}>
        <X className="size-3.5" /> Reject
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPending("escalate")}>
        <AlertTriangle className="size-3.5" /> Escalate
      </Button>
      {mine && (
        <span className="text-[11px] text-muted-foreground ml-1">Assigned to you</span>
      )}
    </div>
  );
}
