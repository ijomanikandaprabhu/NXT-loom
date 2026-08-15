import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { workItems, type WorkItem, type WorkItemStatus } from "@/data/work-items";
import { useAuth } from "@/lib/auth";

/**
 * Review decisions, held over the fixture set.
 *
 * Only the fields a reviewer can actually change are stored, layered on top of
 * the seed items rather than copying them. That keeps a decision meaningful
 * after the fixtures are edited, and makes resetting a demo a single delete.
 *
 * Every decision appends to an activity trail rather than replacing the last
 * one. A status field alone answers "what is it now"; a regulator asks who
 * decided, when, and what it was before — which is the whole Govern claim.
 */

export type ItemAction = "claim" | "approve" | "reject" | "escalate" | "reopen";

export type ActivityEntry = {
  at: string;
  actorName: string;
  actorTitle: string;
  action: ItemAction;
  from: WorkItemStatus;
  to: WorkItemStatus;
  note?: string;
};

type Override = {
  status: WorkItemStatus;
  reviewer: string;
  /** Set on reject and escalate; the reason a human disagreed with the flow. */
  outcome?: "approved" | "rejected" | "escalated";
  activity: ActivityEntry[];
};

const STORE = "nxtloom.itemDecisions";

type ItemsValue = {
  /** Seed items with any decisions applied. */
  items: WorkItem[];
  activityFor: (id: string) => ActivityEntry[];
  outcomeFor: (id: string) => Override["outcome"];
  decide: (id: string, action: ItemAction, note?: string) => void;
  /** Number of items carrying a decision — drives the reset affordance. */
  decidedCount: number;
  reset: () => void;
};

const ItemsContext = createContext<ItemsValue | null>(null);

const nextStatus: Record<ItemAction, WorkItemStatus> = {
  claim: "In Review",
  approve: "Completed",
  reject: "Completed",
  escalate: "Requires Review",
  reopen: "Requires Review",
};

const outcomeOf: Record<ItemAction, Override["outcome"]> = {
  claim: undefined,
  approve: "approved",
  reject: "rejected",
  escalate: "escalated",
  reopen: undefined,
};

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [overrides, setOverrides] = useState<Record<string, Override>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORE) ?? "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(overrides));
  }, [overrides]);

  const value = useMemo<ItemsValue>(() => {
    const items = workItems.map((w) => {
      const o = overrides[w.id];
      return o ? { ...w, status: o.status, reviewer: o.reviewer } : w;
    });

    return {
      items,
      activityFor: (id) => overrides[id]?.activity ?? [],
      outcomeFor: (id) => overrides[id]?.outcome,
      decidedCount: Object.keys(overrides).length,
      reset: () => setOverrides({}),
      decide: (id, action, note) => {
        if (!user) return;
        setOverrides((prev) => {
          const seed = workItems.find((w) => w.id === id);
          if (!seed) return prev;
          const current = prev[id];
          const from = current?.status ?? seed.status;
          const to = nextStatus[action];
          const entry: ActivityEntry = {
            at: new Date().toISOString(),
            actorName: user.name,
            actorTitle: user.title,
            action,
            from,
            to,
            note,
          };
          return {
            ...prev,
            [id]: {
              status: to,
              // Claiming assigns the item; a decision leaves the assignee alone
              // so the trail still shows who was holding it.
              reviewer: action === "claim" ? user.name : (current?.reviewer ?? seed.reviewer),
              outcome: outcomeOf[action],
              activity: [...(current?.activity ?? []), entry],
            },
          };
        });
      },
    };
  }, [overrides, user]);

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
}

export function useItems() {
  const ctx = useContext(ItemsContext);
  if (!ctx) throw new Error("useItems must be used inside <ItemsProvider>");
  return ctx;
}
