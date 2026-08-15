import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, GitBranch, Package, PlayCircle, Send } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAuth } from "@/lib/auth";
import { useMarketData } from "@/lib/market-data";

/**
 * One search across everything the signed-in user may reach.
 *
 * Scoped twice over: to the active market, because a result from another
 * jurisdiction is one a user may have no right to see; and to their allowed
 * routes, because offering a result that redirects on click is worse than not
 * offering it.
 */
export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const { allowedRoutes } = useAuth();
  const d = useMarketData();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const may = (route: string) => allowedRoutes.includes(route);

  const groups = useMemo(() => {
    const hit = (...parts: (string | undefined)[]) =>
      parts.filter(Boolean).join(" ").toLowerCase().includes(q.toLowerCase());

    return [
      {
        label: "Items",
        icon: FileText,
        show: may("/items"),
        rows: d.items.filter((i) => hit(i.title, i.summary, i.itemId, i.type)).slice(0, 5)
          .map((i) => ({ id: i.id, title: i.title, meta: `${i.type} · ${i.status}`, to: `/items/${i.id}` })),
      },
      {
        label: "Products",
        icon: Package,
        show: may("/products"),
        rows: d.products.filter((p) => hit(p.name, p.localName, p.line, p.description)).slice(0, 5)
          .map((p) => ({ id: p.id, title: p.name, meta: `${p.line} · ${p.status} · ${p.version}`, to: `/products` })),
      },
      {
        label: "Flows",
        icon: GitBranch,
        show: may("/flows"),
        rows: d.flows.filter((f) => hit(f.name)).slice(0, 5)
          .map((f) => ({ id: f.id, title: f.name, meta: f.active ? "Active" : "Inactive", to: `/flows/${f.id}` })),
      },
      {
        label: "Placements",
        icon: Send,
        show: may("/placements"),
        rows: d.placements.filter((p) => hit(p.client, p.line, p.id, p.summary)).slice(0, 5)
          .map((p) => ({ id: p.id, title: p.client, meta: `${p.line} · ${p.stage}`, to: `/placements` })),
      },
      {
        label: "Runs",
        icon: PlayCircle,
        show: may("/runs"),
        rows: d.runs.filter((r) => hit(r.flow, r.id, r.status, r.trigger)).slice(0, 5)
          .map((r) => ({ id: r.id, title: r.flow, meta: `${r.id} · ${r.status}`, to: `/runs` })),
      },
    ].filter((g) => g.show && g.rows.length > 0);
  }, [q, d, allowedRoutes]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={`Search ${d.info.flag} ${d.info.name} — items, products, flows, placements, runs`}
        value={q}
        onValueChange={setQ}
      />
      <CommandList>
        {q.trim().length === 0 ? (
          <div className="px-4 py-6 text-center text-[12.5px] text-muted-foreground">
            Searching {d.info.flag} {d.info.name} only. Switch market to look elsewhere.
          </div>
        ) : (
          <CommandEmpty>
            Nothing in {d.info.name} matches “{q}”.
          </CommandEmpty>
        )}

        {groups.map((g) => (
          <CommandGroup key={g.label} heading={g.label}>
            {g.rows.map((r) => (
              <CommandItem
                key={`${g.label}-${r.id}`}
                value={`${g.label} ${r.title} ${r.meta}`}
                onSelect={() => {
                  navigate(r.to);
                  onOpenChange(false);
                }}
                className="gap-2.5"
              >
                <g.icon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{r.title}</span>
                <span className="text-[10.5px] text-muted-foreground shrink-0">{r.meta}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

/** ⌘K / Ctrl-K anywhere, except while typing into something. */
export function useSearchHotkey(onOpen: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "k" || !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      onOpen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
}
