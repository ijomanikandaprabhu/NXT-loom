import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products as seedProducts, type Product } from "@/data/products";

/**
 * Product definitions — the source the claim flow adjudicates against.
 *
 * Seed products are edited by storing a patch rather than a copy, so a change to
 * a benefit schedule survives edits to the fixtures beneath it. Products created
 * here are held whole.
 *
 * Versioning is deliberately naive: a published product that changes gets its
 * minor version bumped. A real implementation needs effective-dating, because a
 * claim must adjudicate against the product as it stood on the loss date, not as
 * it stands today — that is called out in the platform plan and is not solved
 * here.
 */

const STORE_PATCH = "nxtloom.productPatches";
const STORE_NEW = "nxtloom.productsCreated";

export type ProductDraft = Omit<Product, "updated" | "version"> &
  Partial<Pick<Product, "updated" | "version">>;

type ProductsValue = {
  products: Product[];
  byId: (id: string) => Product | undefined;
  save: (draft: ProductDraft) => Product;
  remove: (id: string) => void;
  /** True when this product is not part of the seed set. */
  isCustom: (id: string) => boolean;
  /** True when a seed product carries unsaved-to-fixture edits. */
  isEdited: (id: string) => boolean;
  reset: () => void;
  editedCount: number;
};

const ProductsContext = createContext<ProductsValue | null>(null);

const today = () =>
  new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "/");

/** v5.1 -> v5.2. Drafts stay at v0.1 until first publish. */
function bumpVersion(current: string | undefined, status: Product["status"]) {
  if (!current) return status === "Published" ? "v1.0" : "v0.1";
  const m = /^v(\d+)\.(\d+)$/.exec(current);
  if (!m) return current;
  return `v${m[1]}.${Number(m[2]) + 1}`;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [patches, setPatches] = useState<Record<string, Partial<Product>>>(() =>
    read(STORE_PATCH, {})
  );
  const [created, setCreated] = useState<Product[]>(() => read(STORE_NEW, []));

  useEffect(() => {
    localStorage.setItem(STORE_PATCH, JSON.stringify(patches));
  }, [patches]);
  useEffect(() => {
    localStorage.setItem(STORE_NEW, JSON.stringify(created));
  }, [created]);

  const value = useMemo<ProductsValue>(() => {
    const merged: Product[] = [
      ...seedProducts.map((p) => (patches[p.id] ? { ...p, ...patches[p.id] } : p)),
      ...created,
    ];

    const isCustom = (id: string) => created.some((p) => p.id === id);

    return {
      products: merged,
      byId: (id) => merged.find((p) => p.id === id),
      isCustom,
      isEdited: (id) => Boolean(patches[id]),
      editedCount: Object.keys(patches).length + created.length,
      reset: () => {
        setPatches({});
        setCreated([]);
      },
      remove: (id) => {
        if (isCustom(id)) setCreated((prev) => prev.filter((p) => p.id !== id));
        else
          setPatches((prev) => {
            // Removing a seed product is not deletion — it is dropping the edit.
            const next = { ...prev };
            delete next[id];
            return next;
          });
      },
      save: (draft) => {
        const existing = merged.find((p) => p.id === draft.id);
        const full: Product = {
          ...draft,
          updated: today(),
          version: existing ? bumpVersion(existing.version, draft.status) : bumpVersion(undefined, draft.status),
        } as Product;

        if (existing && !isCustom(draft.id)) {
          setPatches((prev) => ({ ...prev, [draft.id]: full }));
        } else if (existing) {
          setCreated((prev) => prev.map((p) => (p.id === draft.id ? full : p)));
        } else {
          setCreated((prev) => [...prev, full]);
        }
        return full;
      },
    };
  }, [patches, created]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used inside <ProductsProvider>");
  return ctx;
}

/** Blank product, pre-scoped to the market the user is working in. */
export function emptyProduct(market: string, currency: string): ProductDraft {
  return {
    id: `prod-${Date.now().toString(36)}`,
    name: "",
    line: "Health",
    status: "Draft",
    owner: "",
    markets: [market],
    currency: currency as Product["currency"],
    description: "",
    plans: [
      {
        name: "Plan A",
        territory: "",
        premium: "",
        benefits: [{ name: "", limit: "" }],
      },
    ],
    rules: [],
  };
}
