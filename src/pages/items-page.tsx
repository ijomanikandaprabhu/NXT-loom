import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Eye,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  Bot,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, type Status } from "@/components/shell/status-badge";
import { workItems, typeColors } from "@/data/work-items";
import { cn } from "@/lib/utils";
import { useStaggerReveal } from "@/lib/use-stagger-reveal";

const kpis = [
  { n: "9", l: "Requires Review", trend: null, icon: AlertCircle, tone: "danger" as const },
  { n: "2", l: "In Progress", trend: "up", pct: "12%", icon: Clock, tone: "info" as const },
  { n: "2", l: "Complete", trend: "down", pct: "2%", icon: CheckCircle2, tone: "success" as const },
  { n: "23", l: "Completed by Agent (%)", trend: "up", pct: "72%", icon: Bot, tone: "primary" as const },
  { n: "98", l: "Efficiency Gained (%)", trend: "up", pct: "72%", icon: Zap, tone: "amber" as const },
];

const tileTone = {
  danger: { border: "border-destructive/25", bg: "bg-destructive/[0.05]", icon: "bg-destructive/15 text-destructive" },
  info: { border: "border-info/25", bg: "bg-info/[0.05]", icon: "bg-info/15 text-info" },
  success: { border: "border-success/25", bg: "bg-success/[0.05]", icon: "bg-success/15 text-success" },
  primary: { border: "border-primary/25", bg: "bg-primary/[0.05]", icon: "bg-primary/15 text-primary" },
  amber: { border: "border-amber-500/25", bg: "bg-amber-500/[0.06]", icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
};

const statusMap: Record<string, Status> = {
  "Requires Review": "danger",
  "In Review": "info",
  Completed: "success",
};

export default function ItemsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = workItems.filter(
    (i) =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.summary.toLowerCase().includes(query.toLowerCase())
  );

  const listRef = useStaggerReveal<HTMLDivElement>([query]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 pt-7 pb-10 max-w-[1200px] mx-auto w-full">
        <h1 className="text-[26px] font-bold tracking-tight">Work Items</h1>

        <div className="grid grid-cols-5 gap-3 mt-6">
          {kpis.map((k) => {
            const tone = tileTone[k.tone];
            return (
              <div key={k.l} className={cn("rounded-xl border p-4", tone.border, tone.bg)}>
                <span className={cn("size-7 rounded-md flex items-center justify-center mb-2.5", tone.icon)}>
                  <k.icon className="size-3.5" />
                </span>
                <div className="text-[26px] font-bold tracking-tight tabular-nums">{k.n}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11.5px] text-muted-foreground">{k.l}</span>
                  {k.trend && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-[10.5px] font-bold",
                        k.trend === "up" ? "text-success" : "text-destructive"
                      )}
                    >
                      {k.trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      {k.pct}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 mt-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="pl-8 h-9 text-[12.5px]"
            />
          </div>
          <Button variant="outline" size="sm" className="ml-auto gap-1.5">
            <SlidersHorizontal className="size-3.5" /> Configure Columns
          </Button>
        </div>

        <div ref={listRef} className="mt-4 border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Agent Summary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Item ID</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} data-stagger-item className="cursor-pointer" onClick={() => navigate(`/items/${item.id}`)}>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-wide">
                      <span className={cn("w-1 h-3.5 rounded-full", typeColors[item.type])} />
                      {item.type}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[360px]">
                    <div className="text-[12.5px] font-semibold text-primary truncate">{item.title}</div>
                    <div className="text-[11.5px] text-muted-foreground truncate mt-0.5">{item.summary}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={statusMap[item.status]}>{item.status}</StatusBadge>
                  </TableCell>
                  <TableCell className="font-mono text-[11.5px] text-muted-foreground">{item.itemId}</TableCell>
                  <TableCell className="text-[12.5px]">{item.reviewer}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                      <button className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary">
                        <Eye className="size-3.5" />
                      </button>
                      <button className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary">
                        <FileText className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
