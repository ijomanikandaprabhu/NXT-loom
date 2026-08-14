import { Check, ChevronDown, Globe, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markets, marketByCode } from "@/data/locale";
import { languages, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function MarketSwitcher() {
  const { market, setMarket, currency, t } = useI18n();
  const active = marketByCode(market);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md border bg-secondary/60 pl-2.5 pr-2 py-1.5 text-[12px] text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors cursor-pointer">
          <span className="text-[13px] leading-none">{active.flag}</span>
          <span className="font-medium">{active.name}</span>
          <span className="text-[10.5px] font-mono text-muted-foreground">{currency}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[268px]">
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
              <div className="text-[12.5px] font-medium">{m.name}</div>
              <div className="text-[10.5px] text-muted-foreground">
                {m.regulator} · {m.currency}
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
  );
}

export function LanguageSwitcher() {
  const { lang, setLang, market, t } = useI18n();
  const active = languages.find((l) => l.code === lang)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-md border bg-secondary/60 px-2.5 py-1.5 text-[12px] text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          title={t("shell.language")}
        >
          <Languages className="size-3.5 text-muted-foreground" />
          <span className="font-medium uppercase text-[11px] tracking-wide">{active.code}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[236px]">
        <DropdownMenuLabel className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Languages className="size-3" /> {t("shell.language")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((l) => {
          const inMarket = l.markets.includes(market);
          return (
            <DropdownMenuItem
              key={l.code}
              onClick={() => setLang(l.code)}
              className="cursor-pointer gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className={cn("text-[12.5px]", l.code === lang && "font-semibold")}>
                  {l.nativeName}
                </div>
                <div className="text-[10.5px] text-muted-foreground">
                  {l.name}
                  {inMarket && <span className="text-success"> · used here</span>}
                </div>
              </div>
              {l.code === lang && <Check className="size-3.5 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
