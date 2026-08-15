import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMarketData } from "@/lib/market-data";
import { MarketEmpty } from "@/components/shell/market-empty";
import { cn } from "@/lib/utils";
import { useStaggerReveal } from "@/lib/use-stagger-reveal";
import { useI18n } from "@/lib/i18n";

const tabs = ["All", "Active", "Inactive"] as const;

export default function FlowsPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { flows } = useMarketData();
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = flows.filter((f) => {
    if (tab === "Active" && !f.active) return false;
    if (tab === "Inactive" && f.active) return false;
    return f.name.toLowerCase().includes(query.toLowerCase());
  });

  const listRef = useStaggerReveal<HTMLDivElement>([tab, query]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 pt-7 pb-5 max-w-[1080px] mx-auto w-full">
        <h1 className="text-[26px] font-bold tracking-tight">{t("flows.title")}</h1>
        <p className="text-muted-foreground text-[13.5px] mt-1">
          {t("flows.subtitle")}
        </p>

        <div ref={listRef} className="mt-6 border rounded-xl bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b flex-wrap">
            <span className="font-semibold text-[14px]">Flows in NXT Loom Demo</span>
            <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border rounded-full px-2 py-0.5">
              {flows.length} Flows
            </span>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Sparkles className="size-3.5" /> Build with AI Agent
              </Button>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3.5" /> Create flow
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-b">
            <div className="flex border rounded-md overflow-hidden">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-semibold",
                    t === tab ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    t !== "All" && "border-l"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="pl-8 h-8 text-[12.5px]"
              />
            </div>
          </div>

          {flows.length === 0 ? (
            <div className="p-6"><MarketEmpty what="flows" action="Create flow" /></div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow
                  key={f.id}
                  data-stagger-item
                  className="cursor-pointer"
                  onClick={() => navigate(`/flows/${f.id}`)}
                >
                  <TableCell className="font-medium text-[13px]">{f.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Switch checked={f.active} className="scale-90" />
                      <span className="text-[11px] font-bold text-success uppercase tracking-wide">
                        {f.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[12.5px] text-muted-foreground tabular-nums">
                    {f.created}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <button className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary">
                        <Pencil className="size-3.5" />
                      </button>
                      <button className="size-7 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}

          <div className="flex items-center justify-between px-5 py-3 text-[12px] text-muted-foreground">
            <span>
              Showing <b className="text-foreground">{filtered.length}</b> of {flows.length} flows
            </span>
            <div className="flex items-center gap-3">
              <span className="opacity-50">Previous</span>
              <span>Page 1 of 1</span>
              <span className="opacity-50">Next</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
