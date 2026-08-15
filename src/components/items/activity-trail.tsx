import { AlertTriangle, Check, Undo2, UserPlus, X } from "lucide-react";
import { useItems, type ItemAction } from "@/lib/items-store";
import { cn } from "@/lib/utils";

const icon: Record<ItemAction, typeof Check> = {
  claim: UserPlus,
  approve: Check,
  reject: X,
  escalate: AlertTriangle,
  reopen: Undo2,
};

const tone: Record<ItemAction, string> = {
  claim: "text-muted-foreground bg-secondary",
  approve: "text-success bg-success/12",
  reject: "text-destructive bg-destructive/12",
  escalate: "text-warning bg-warning/15",
  reopen: "text-info bg-info/12",
};

const verb: Record<ItemAction, string> = {
  claim: "assigned this to themselves",
  approve: "approved this item",
  reject: "rejected this item",
  escalate: "escalated this item",
  reopen: "reopened this item",
};

/**
 * Per-item decision history.
 *
 * The unit a regulator asks about is not the current status but the sequence
 * that produced it, so entries are shown oldest first and never collapsed.
 */
export function ActivityTrail({ itemId }: { itemId: string }) {
  const { activityFor } = useItems();
  const entries = activityFor(itemId);

  if (entries.length === 0) {
    return (
      <p className="text-[12px] text-muted-foreground">
        No human decision recorded yet — this item is as the flow left it.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-2.5">
      {entries.map((e, i) => {
        const Icon = icon[e.action];
        return (
          <li key={i} className="flex gap-2.5">
            <span
              className={cn(
                "size-6 shrink-0 rounded-full grid place-items-center mt-0.5",
                tone[e.action]
              )}
            >
              <Icon className="size-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] leading-snug">
                <span className="font-semibold">{e.actorName}</span>{" "}
                <span className="text-muted-foreground">({e.actorTitle})</span> {verb[e.action]}
              </p>
              <p className="text-[10.5px] text-muted-foreground font-mono">
                {e.from} → {e.to} ·{" "}
                {new Date(e.at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              {e.note && (
                <p className="mt-1 text-[12px] border-l-2 border-border pl-2.5 text-muted-foreground">
                  {e.note}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
