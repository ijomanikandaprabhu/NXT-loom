import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { placements as seedPlacements, type Placement, type CarrierQuote } from "@/data/placements";
import { useAuth } from "@/lib/auth";

/**
 * Placement decisions.
 *
 * The moment that matters here is the bind: it commits the client to a carrier
 * and fixes the commission, so it is the one action in the app gated on a money
 * limit rather than a capability alone. Over the limit the control does not
 * disappear — it becomes a referral, because the broker still has to do
 * something and hiding the button would only send them to email.
 */

export type PlacementEvent = {
  at: string;
  actorName: string;
  action: "bound" | "referred" | "chased";
  carrier?: string;
  note?: string;
};

type Override = {
  stage?: Placement["stage"];
  quotes?: CarrierQuote[];
  events: PlacementEvent[];
};

const STORE_PATCH = "nxtloom.placementDecisions";
const STORE_NEW = "nxtloom.placementsCreated";

export type BindCheck =
  | { allowed: true }
  | { allowed: false; reason: "capability" }
  | { allowed: false; reason: "authority"; limit: number };

type PlacementsValue = {
  placements: Placement[];
  eventsFor: (id: string) => PlacementEvent[];
  /** Whether this user may bind this premium, and why not if they may not. */
  canBind: (premium: number) => BindCheck;
  bind: (id: string, carrier: string) => void;
  refer: (id: string, carrier: string, note: string) => void;
  chase: (id: string) => void;
  add: (p: Placement) => void;
  reset: () => void;
  changedCount: number;
};

const PlacementsContext = createContext<PlacementsValue | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function PlacementsProvider({ children }: { children: React.ReactNode }) {
  const { user, can, external } = useAuth();
  const [patches, setPatches] = useState<Record<string, Override>>(() => read(STORE_PATCH, {}));
  const [created, setCreated] = useState<Placement[]>(() => read(STORE_NEW, []));

  useEffect(() => {
    localStorage.setItem(STORE_PATCH, JSON.stringify(patches));
  }, [patches]);
  useEffect(() => {
    localStorage.setItem(STORE_NEW, JSON.stringify(created));
  }, [created]);

  const value = useMemo<PlacementsValue>(() => {
    const all: Placement[] = [
      ...seedPlacements.map((p) => {
        const o = patches[p.id];
        return o ? { ...p, stage: o.stage ?? p.stage, quotes: o.quotes ?? p.quotes } : p;
      }),
      ...created,
    ];

    // The tenant boundary is applied here, not in the page. Filtering in a
    // component leaves every other consumer of this store — KPI tiles, Copilot,
    // a future export — reading the whole book.
    const merged = external ? all.filter((p) => p.handler === external.handle) : all;

    const base = (id: string) => merged.find((p) => p.id === id);

    const record = (id: string, ev: PlacementEvent, patch: Partial<Override>) =>
      setPatches((prev) => {
        const cur = prev[id];
        return {
          ...prev,
          [id]: {
            stage: patch.stage ?? cur?.stage,
            quotes: patch.quotes ?? cur?.quotes,
            events: [...(cur?.events ?? []), ev],
          },
        };
      });

    return {
      placements: merged,
      eventsFor: (id) => patches[id]?.events ?? [],
      changedCount: Object.keys(patches).length + created.length,
      reset: () => {
        setPatches({});
        setCreated([]);
      },
      add: (p) => setCreated((prev) => [p, ...prev]),

      canBind: (premium) => {
        if (!can("placement.bind")) return { allowed: false, reason: "capability" };
        const limit = user?.bindAuthority;
        // No stated limit means unlimited within the role, not zero.
        if (limit !== undefined && premium > limit)
          return { allowed: false, reason: "authority", limit };
        return { allowed: true };
      },

      bind: (id, carrier) => {
        const p = base(id);
        if (!p || !user) return;
        record(
          id,
          { at: new Date().toISOString(), actorName: user.name, action: "bound", carrier },
          {
            stage: "Bound",
            // Binding one carrier settles the others: a quote left "Quoted" beside
            // a bound placement reads as though it were still live.
            quotes: p.quotes.map((q) =>
              q.carrier === carrier
                ? { ...q, status: "Bound" as const }
                : q.status === "Quoted" || q.status === "Pending"
                  ? { ...q, status: "Declined" as const }
                  : q
            ),
          }
        );
      },

      refer: (id, carrier, note) => {
        if (!user) return;
        record(
          id,
          { at: new Date().toISOString(), actorName: user.name, action: "referred", carrier, note },
          { stage: "Awaiting client" }
        );
      },

      chase: (id) => {
        const p = base(id);
        if (!p || !user) return;
        const pending = p.quotes.filter((q) => q.status === "Pending").length;
        record(
          id,
          {
            at: new Date().toISOString(),
            actorName: user.name,
            action: "chased",
            note: `${pending} carrier${pending === 1 ? "" : "s"} chased`,
          },
          {}
        );
      },
    };
  }, [patches, created, user, can, external]);

  return <PlacementsContext.Provider value={value}>{children}</PlacementsContext.Provider>;
}

export function usePlacements() {
  const ctx = useContext(PlacementsContext);
  if (!ctx) throw new Error("usePlacements must be used inside <PlacementsProvider>");
  return ctx;
}
