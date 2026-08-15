import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useOrg } from "@/lib/org-store";

/** Shown when the active market has no records of a given kind. */
export function MarketEmpty({
  what,
  action,
}: {
  what: string;
  action?: string;
}) {
  const { market } = useI18n();
  // Must read through the org store, not the seed table: marketByCode falls
  // back to Singapore for admin-created markets, which made this panel name a
  // different country than the switcher was showing.
  const { markets, marketFor } = useOrg();
  const m = marketFor(market) ?? markets[0];

  return (
    <div className="border rounded-xl bg-card p-14 flex flex-col items-center text-center">
      <span className="size-11 rounded-full bg-accent flex items-center justify-center mb-4">
        <Inbox className="size-5 text-accent-foreground" />
      </span>
      <p className="text-[14px] font-semibold">
        No {what} in {m.flag} {m.name}
      </p>
      <p className="text-[12.5px] text-muted-foreground mt-1.5 max-w-[340px]">
        This market is scoped to {m.regulator} and {m.currency}. Switch market from the button in the
        bottom-left corner to see{" "}
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
