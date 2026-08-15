import { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrg, type BranchType, type BranchStatus } from "@/lib/org-store";

const blank = {
  name: "",
  code: "",
  marketCode: "",
  city: "",
  type: "Branch" as BranchType,
  status: "Setup" as BranchStatus,
  manager: "",
};

export function AddBranchDialog({ defaultMarket }: { defaultMarket?: string }) {
  const { markets, branches, addBranch, marketFor } = useOrg();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ ...blank, marketCode: defaultMarket ?? "" });

  const set = (k: keyof typeof blank, v: string) => setF((p) => ({ ...p, [k]: v }));

  const codeTaken = branches.some(
    (b) => b.code.toUpperCase() === f.code.toUpperCase() && f.code.trim() !== ""
  );
  const valid = f.name.trim() && f.code.trim() && f.marketCode && f.city.trim() && !codeTaken;

  const mapped = f.marketCode ? marketFor(f.marketCode) : undefined;

  const submit = () => {
    if (!valid) return;
    addBranch({
      name: f.name.trim(),
      code: f.code.toUpperCase().trim(),
      marketCode: f.marketCode,
      city: f.city.trim(),
      type: f.type,
      status: f.status,
      manager: f.manager.trim() || "Unassigned",
    });
    setF({ ...blank, marketCode: defaultMarket ?? "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-3.5" /> Add branch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add a branch</DialogTitle>
          <DialogDescription>
            Branches report into exactly one market and inherit its currency, regulator, and data
            residency rules.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label className="text-[11.5px] mb-1.5">Branch name</Label>
              <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Phnom Penh Branch" />
            </div>
            <div>
              <Label className="text-[11.5px] mb-1.5">Code</Label>
              <Input
                value={f.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="KH-PNH"
              />
            </div>
          </div>
          {codeTaken && (
            <p className="text-[11.5px] text-destructive -mt-2">
              Branch code {f.code} is already in use.
            </p>
          )}

          <div>
            <Label className="text-[11.5px] mb-1.5">Maps to market</Label>
            <Select value={f.marketCode} onValueChange={(v) => set("marketCode", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select the country this branch reports into" />
              </SelectTrigger>
              <SelectContent>
                {markets.map((m) => (
                  <SelectItem key={m.code} value={m.code}>
                    {m.flag} {m.name} · {m.currency} · {m.regulator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mapped && (
            <div className="rounded-lg border bg-secondary/50 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                <MapPin className="size-3" /> Inherited from {mapped.name}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11.5px]">
                <span>
                  Currency <b className="font-semibold">{mapped.currency}</b>
                </span>
                <span>
                  Regulator <b className="font-semibold">{mapped.regulator}</b>
                </span>
                <span>
                  Data{" "}
                  <b
                    className={
                      mapped.residency === "required"
                        ? "font-semibold text-destructive"
                        : "font-semibold"
                    }
                  >
                    {mapped.residency === "required"
                      ? "in-country required"
                      : mapped.residency === "preferred"
                        ? "in-region preferred"
                        : "no restriction"}
                  </b>
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[11.5px] mb-1.5">City</Label>
              <Input value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="Phnom Penh" />
            </div>
            <div>
              <Label className="text-[11.5px] mb-1.5">Type</Label>
              <Select value={f.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Head office">Head office</SelectItem>
                  <SelectItem value="Branch">Branch</SelectItem>
                  <SelectItem value="Agency">Agency</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11.5px] mb-1.5">Status</Label>
              <Select value={f.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Setup">Setup</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-[11.5px] mb-1.5">Branch manager</Label>
            <Input value={f.manager} onChange={(e) => set("manager", e.target.value)} placeholder="Optional" />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" disabled={!valid} onClick={submit}>
            Create branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
