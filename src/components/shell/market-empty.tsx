import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { marketByCode } from "@/data/locale";

/** Shown when the active market has no records of a given kind. */
export function MarketEmpty({
  what,
  action,
}: {
  what: string;
  action?: string;
}) {
  const { market } = useI18n();
  const m = marketByCode(market);

  return (
    <div className="border rounded-xl bg-card p-14 flex flex-col items-center text-center">
      <span className="size-11 rounded-full bg-accent flex items-center justify-center mb-4">
        <Inbox className="size-5 text-accent-foreground" />
      </span>
      <p className="text-[14px] font-semibold">
        No {what} in {m.flag} {m.name}
      </p>
      <p className="text-[12.5px] text-muted-foreground mt-1.5 max-w-[340px]">
        This market is scoped to {m.regulator} and {m.currency}. Switch market in the top bar to see{" "}
        {what} elsewhere{action ? `, or create the first one here` : ""}.
      </p>
      {action && (
        <Button size="sm" className="mt-5">
          {action}
        </Button>
      )}
    </div>
  );
}
