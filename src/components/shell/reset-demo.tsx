import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useItems } from "@/lib/items-store";
import { useProducts } from "@/lib/products-store";
import { useOrg } from "@/lib/org-store";

/**
 * Returns the workspace to its seed state.
 *
 * Everything a demo touches now persists — review decisions, product edits,
 * admin-created markets and branches. Without this, the second demo of the day
 * starts inside the wreckage of the first, and the fastest workaround people
 * reach for is clearing site data, which also signs them out.
 *
 * The counts are shown rather than a generic warning, so the person clicking
 * knows exactly what they are discarding.
 *
 * Fully controlled and rendered outside the menu that opens it: a dialog nested
 * inside a dropdown is unmounted the moment the dropdown closes.
 */
export function ResetDemo({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { decidedCount, reset: resetItems } = useItems();
  const { editedCount, reset: resetProducts } = useProducts();
  const { customMarkets, resetOrg } = useOrg();

  const changes = [
    { n: decidedCount, label: decidedCount === 1 ? "reviewed item" : "reviewed items" },
    { n: editedCount, label: editedCount === 1 ? "product change" : "product changes" },
    { n: customMarkets.length, label: customMarkets.length === 1 ? "custom market" : "custom markets" },
  ].filter((c) => c.n > 0);

  const total = changes.reduce((n, c) => n + c.n, 0);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset this workspace?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2.5">
              {total === 0 ? (
                <p className="text-[13px]">
                  Nothing has been changed yet — the workspace is already in its seed state.
                </p>
              ) : (
                <>
                  <p className="text-[13px]">This discards:</p>
                  <ul className="text-[13px] list-disc pl-5 space-y-0.5">
                    {changes.map((c) => (
                      <li key={c.label}>
                        <span className="font-semibold text-foreground">{c.n}</span> {c.label}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[12px]">
                    Branches return to their seed list. You stay signed in, and the seed
                    items, products and flows are untouched.
                  </p>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={total === 0}
            onClick={() => {
              resetItems();
              resetProducts();
              resetOrg();
              onOpenChange(false);
            }}
          >
            Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
