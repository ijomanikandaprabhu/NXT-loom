import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Eye, LogOut, RotateCcw, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { ResetDemo } from "./reset-demo";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { navItems } from "./nav-items";
import { LanguageSwitcher } from "./locale-switcher";

const groupKey = { Build: "group.build", Run: "group.run", Govern: "group.govern" } as const;
const navKey: Record<string, string> = {
  "/products": "nav.products",
  "/flows": "nav.flows",
  "/placements": "nav.placements",
  "/runs": "nav.runs",
  "/items": "nav.items",
  "/insights": "nav.insights",
  "/settings": "nav.settings",
};

export function AppTopbar() {
  const location = useLocation();
  const { t } = useI18n();
  const { user, allowedRoutes, signOut } = useAuth();
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);

  // Hide what the role cannot reach. RequireAuth still refuses a typed URL —
  // this only keeps the bar honest about what is actually available.
  const visible = navItems.filter((n) => allowedRoutes.includes(n.href));
  const groups = (["Build", "Run", "Govern"] as const).filter((g) =>
    visible.some((n) => n.group === g)
  );

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
        {t("nav.copilot")}
      </Link>

      <nav className="flex items-center gap-4">
        {groups.map((g, gi) => (
          <div key={g} className="flex items-center gap-1">
            {gi > 0 && <span className="w-px h-4 bg-border mr-3" />}
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground/60 mr-1.5">
              {t(groupKey[g])}
            </span>
            {visible
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
                    {t(navKey[item.href] ?? item.label)}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      <div className="flex-1" />

      <span className="inline-flex items-center gap-1 text-[11.5px] text-success font-semibold">
        <span className="size-1.5 rounded-full bg-success" />
        {t("shell.production")}
      </span>

      <LanguageSwitcher />

      <button className="relative text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        <Bell className="size-[18px]" />
      </button>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 cursor-pointer rounded-full hover:bg-secondary/60 transition-colors pl-2 pr-1 py-1">
              {user.readOnly && (
                <span
                  className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 bg-warning/15 text-warning"
                  title="This role can read everything and change nothing"
                >
                  <Eye className="size-2.5" /> read-only
                </span>
              )}
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-bold">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[224px]">
            <DropdownMenuLabel className="pb-1">
              <div className="text-[12.5px] font-semibold leading-tight">{user.name}</div>
              <div className="text-[11px] font-normal text-muted-foreground">{user.title}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-[10.5px] text-muted-foreground leading-snug">
              <span className="uppercase tracking-wide font-bold">{user.base}</span>
              {user.branch && <> · {user.branch}</>}
              <div className="mt-0.5">
                {user.markets.length === 6 ? "All markets" : user.markets.join(", ")}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setResetOpen(true)}>
              <RotateCcw className="size-3.5" /> Reset demo data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => {
                signOut();
                navigate("/login", { replace: true });
              }}
            >
              <LogOut className="size-3.5" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <ResetDemo open={resetOpen} onOpenChange={setResetOpen} />
    </header>
  );
}
