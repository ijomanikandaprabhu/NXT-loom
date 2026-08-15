import { useState } from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePlacements } from "@/lib/placements-store";
import { useI18n } from "@/lib/i18n";
import type { CarrierQuote, Placement } from "@/data/placements";

/**
 * Bind, or refer when the premium exceeds the user's authority.
 *
 * Over the limit the control is not hidden. The broker still has a decision to
 * make, and a missing button sends them to email — outside the audit trail,
 * which is the one place this system cannot afford to lose them.
 */
export function BindAction({ placement, quote }: { placement: Placement; quote: CarrierQuote }) {
  const { canBind, bind, refer } = usePlacements();
  const { money } = useI18n();
  const [referring, setReferring] = useState(false);
  const [note, setNote] = useState("");

  if (placement.stage === "Bound" || placement.stage === "Lost") return null;
  if (!quote.premium || quote.status === "Declined") return null;

  const check = canBind(quote.premium);

  if (check.allowed) {
    return (
      <Button size="sm" className="mt-3" onClick={() => bind(placement.id, quote.carrier)}>
        Bind with {quote.carrier}
      </Button>
    );
  }

  if (check.reason === "capability") {
    return (
      <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <Lock className="size-3.5 shrink-0" />
        Your role can compare quotes but not bind them.
      </p>
    );
  }

  if (referring) {
    return (
      <div className="mt-3 rounded-lg border bg-background p-3 flex flex-col gap-2">
        <label htmlFor={`refer-${quote.carrier}`} className="text-[11.5px] font-semibold">
          Why should this be bound above your limit?
        </label>
        <Textarea
          id={`refer-${quote.carrier}`}
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Long-standing client, clean loss history, terms match the slip exactly"
          className="min-h-[64px] text-[12.5px]"
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={note.trim().length < 4}
            onClick={() => {
              refer(placement.id, quote.carrier, note.trim());
              setNote("");
              setReferring(false);
            }}
          >
            Send referral
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setReferring(false); setNote(""); }}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-2.5 flex-wrap">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setReferring(true)}>
        <ShieldAlert className="size-3.5" /> Refer to bind
      </Button>
      <span className="text-[11.5px] text-warning">
        {money(quote.premium, placement.currency)} exceeds your authority of{" "}
        {money(check.limit, placement.currency)}.
      </span>
    </div>
  );
}
