import { Link, useLocation } from "react-router-dom";
import { Bell, ChevronDown, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

const groups = ["Build", "Run", "Govern"] as const;

export function AppTopbar() {
  const location = useLocation();

  return (
    <header className="h-14 shrink-0 border-b bg-card flex items-center gap-5 px-5">
      <Link to="/assistant" className="flex items-center gap-2 shrink-0">
        <img src="/technxt-mark.svg" alt="" className="size-6 shrink-0" />
        <span className="font-bold text-[15.5px] tracking-tight leading-none">NXT Loom</span>
      </Link>

      <Link
        to="/assistant"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
          location.pathname.startsWith("/assistant")
            ? "bg-accent text-accent-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
        )}
      >
        <Sparkles className="size-3.5" />
        Copilot
      </Link>

      <nav className="flex items-center gap-4">
        {groups.map((g, gi) => (
          <div key={g} className="flex items-center gap-1">
            {gi > 0 && <span className="w-px h-4 bg-border mr-3" />}
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground/60 mr-1.5">
              {g}
            </span>
            {navItems
              .filter((n) => n.group === g)
              .map((item) => {
                const active = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      <div className="flex-1" />

      <button className="flex items-center gap-2 rounded-md border bg-secondary/60 pl-2.5 pr-2 py-1.5 text-[12px] text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors cursor-pointer">
        <span className="font-medium">Northbridge Demo Org</span>
        <span className="text-muted-foreground">/</span>
        <span className="inline-flex items-center gap-1 text-success font-semibold">
          <span className="size-1.5 rounded-full bg-success" />
          Production
        </span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </button>

      <button className="relative text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        <Bell className="size-[18px]" />
      </button>

      <Avatar className="size-7 cursor-pointer">
        <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-bold">
          SC
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
