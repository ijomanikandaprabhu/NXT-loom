import { Check, ChevronUp, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrg } from "@/lib/org-store";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Market switcher docked to the bottom-left of the viewport.
 * Sits above page content so it stays reachable on every screen.
 */
export function FloatingMarketSwitcher() {
  const { market, setMarket, t } = useI18n();
  const { markets, marketFor, branchesFor } = useOrg();
  const active = marketFor(market) ?? markets[0];

  return (
    <div
      className="fixed left-4 z-50 transition-[bottom] duration-200"
      style={{ bottom: "calc(1rem + var(--run-console-h, 0px))" }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "group flex items-center gap-2 rounded-full border bg-card pl-3 pr-2.5 py-2 shadow-lg",
              "hover:shadow-xl hover:border-primary/40 transition-all cursor-pointer"
            )}
            title={`${t("shell.market")} — ${active.name}`}
          >
            <span className="text-[15px] leading-none">{active.flag}</span>
            <span className="text-[12.5px] font-semibold leading-none">{active.name}</span>
            <span className="text-[10.5px] font-mono text-muted-foreground leading-none">
              {active.currency}
            </span>
            {active.residency === "required" && (
              <span
                className="size-1.5 rounded-full bg-destructive"
                title="Personal data must stay in-country"
              />
            )}
            <ChevronUp className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-[272px]">
          <DropdownMenuLabel className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Globe className="size-3" /> {t("shell.market")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {markets.map((m) => (
            <DropdownMenuItem
              key={m.code}
              onClick={() => setMarket(m.code)}
              className="cursor-pointer gap-2"
            >
              <span className="text-[14px] leading-none">{m.flag}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium flex items-center gap-1.5">
                  {m.name}
                  {"custom" in m && (
                    <span className="text-[9px] font-bold uppercase tracking-wide rounded bg-info/15 text-info px-1">
                      custom
                    </span>
                  )}
                </div>
                <div className="text-[10.5px] text-muted-foreground">
                  {m.regulator} · {m.currency} · {branchesFor(m.code).length} branches
                  {m.residency === "required" && (
                    <span className="text-destructive"> · in-country data</span>
                  )}
                </div>
              </div>
              {m.code === market && <Check className="size-3.5 text-primary shrink-0" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
