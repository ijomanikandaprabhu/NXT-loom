import { useState } from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { nodeLibrary } from "@/data/node-library";
import { cn } from "@/lib/utils";

export function NodePanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");

  const groups = nodeLibrary
    .map((g) => ({
      ...g,
      nodes: g.nodes.filter((n) =>
        `${n.name} ${n.desc}`.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((g) => g.nodes.length > 0);

  return (
    <div className="absolute left-3 top-3 z-20 w-[286px] max-h-[calc(100%-24px)] rounded-xl border bg-card shadow-lg flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <h3 className="text-[14px] font-bold flex-1">Nodes</h3>
        <button
          onClick={onClose}
          className="size-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary cursor-pointer"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes"
            className="pl-8 h-9 text-[12.5px]"
          />
        </div>
      </div>

      <div className="overflow-auto p-3 grid grid-cols-2 gap-x-3 gap-y-4 content-start">
        {groups.map((g) => (
          <div key={g.group} className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={cn("size-1.5 rounded-full", g.dot)} />
              <h4 className="text-[11.5px] font-semibold">{g.group}</h4>
            </div>
            <div className="space-y-1.5">
              {g.nodes.map((n) => (
                <button
                  key={n.name}
                  disabled={n.disabled}
                  className={cn(
                    "w-full text-left rounded-lg border p-2 transition-colors",
                    n.disabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:border-primary/40 hover:bg-secondary/60 cursor-grab"
                  )}
                >
                  <div className="text-[11.5px] font-semibold leading-tight truncate">{n.name}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                    {n.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
