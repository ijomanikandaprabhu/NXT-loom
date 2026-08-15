import { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";
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
import { useOrg, isCodeTaken, type CustomMarket } from "@/lib/org-store";
import { cn } from "@/lib/utils";

const blank = {
  code: "",
  name: "",
  flag: "",
  currency: "",
  currencySymbol: "",
  currencyDecimals: "2",
  currencyGroup: ",",
  currencyDecimalMark: ".",
  currencySuffix: "false",
  regulator: "",
  regulatorName: "",
  languages: "",
  residency: "preferred",
  takaful: "false",
  dataLaw: "",
};

export function AddMarketDialog() {
  const { markets, addMarket } = useOrg();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ ...blank });

  const set = (k: keyof typeof blank, v: string) => setF((p) => ({ ...p, [k]: v }));

  const codeTaken = f.code.length >= 2 && isCodeTaken(markets, f.code);
  const valid =
    f.code.trim().length >= 2 &&
    !codeTaken &&
    f.name.trim() &&
    f.currency.trim().length >= 3 &&
    f.currencySymbol.trim() &&
    f.regulator.trim();

  /** Live preview of how money will render with the chosen rule. */
  const preview = (() => {
    const amount = 1234567.89;
    const decimals = Number(f.currencyDecimals) as 0 | 2;
    const fixed = amount.toFixed(decimals);
    const [whole, frac] = fixed.split(".");
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, f.currencyGroup);
    const body = frac ? `${grouped}${f.currencyDecimalMark}${frac}` : grouped;
    const sym = f.currencySymbol || "¤";
    return f.currencySuffix === "true" ? `${body}${sym}` : `${sym}${body}`;
  })();

  const submit = () => {
    if (!valid) return;
    const market: CustomMarket = {
      custom: true,
      code: f.code.toUpperCase().slice(0, 3),
      name: f.name.trim(),
      flag: f.flag.trim() || "🏳️",
      currency: f.currency.toUpperCase().trim(),
      currencySymbol: f.currencySymbol.trim(),
      currencyDecimals: Number(f.currencyDecimals) as 0 | 2,
      currencyGroup: f.currencyGroup as "," | ".",
      currencyDecimalMark: f.currencyDecimalMark as "." | ",",
      currencySuffix: f.currencySuffix === "true",
      regulator: f.regulator.toUpperCase().trim(),
      regulatorName: f.regulatorName.trim() || f.regulator.toUpperCase().trim(),
      languages: f.languages
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      residency: f.residency as CustomMarket["residency"],
      takaful: f.takaful === "true",
      dataLaw: f.dataLaw.trim() || "Not specified",
    };
    addMarket(market);
    setF({ ...blank });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-3.5" /> Add market
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[620px] max-h-[86vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a market</DialogTitle>
          <DialogDescription>
            Define the country, its currency formatting, and how its data must be held. Branches can
            then be mapped to it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Section title="Country" />
          <div className="grid grid-cols-3 gap-3">
            <Field label="ISO code" hint="2–3 letters">
              <Input
                value={f.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="KH"
                maxLength={3}
                className={cn(codeTaken && "border-destructive")}
              />
            </Field>
            <Field label="Name" className="col-span-2">
              <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Cambodia" />
            </Field>
          </div>
          {codeTaken && (
            <p className="flex items-center gap-1.5 text-[11.5px] text-destructive -mt-2">
              <AlertTriangle className="size-3" /> {f.code} already exists. Pick another code.
            </p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Field label="Flag emoji">
              <Input value={f.flag} onChange={(e) => set("flag", e.target.value)} placeholder="🇰🇭" />
            </Field>
            <Field label="Languages" hint="comma separated" className="col-span-2">
              <Input value={f.languages} onChange={(e) => set("languages", e.target.value)} placeholder="Khmer, English" />
            </Field>
          </div>

          <Section title="Currency" />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Code">
              <Input
                value={f.currency}
                onChange={(e) => set("currency", e.target.value.toUpperCase())}
                placeholder="KHR"
                maxLength={3}
              />
            </Field>
            <Field label="Symbol">
              <Input value={f.currencySymbol} onChange={(e) => set("currencySymbol", e.target.value)} placeholder="៛" />
            </Field>
            <Field label="Decimal places">
              <Select value={f.currencyDecimals} onValueChange={(v) => set("currencyDecimals", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 — e.g. SGD, MYR</SelectItem>
                  <SelectItem value="0">0 — e.g. IDR, VND</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Thousands separator">
              <Select value={f.currencyGroup} onValueChange={(v) => set("currencyGroup", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma — 1,234,567</SelectItem>
                  <SelectItem value=".">Period — 1.234.567</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Decimal mark">
              <Select value={f.currencyDecimalMark} onValueChange={(v) => set("currencyDecimalMark", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=".">Period — 1.50</SelectItem>
                  <SelectItem value=",">Comma — 1,50</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Symbol position">
              <Select value={f.currencySuffix} onValueChange={(v) => set("currencySuffix", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Before — S$100</SelectItem>
                  <SelectItem value="true">After — 100₫</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="rounded-lg border bg-secondary/50 px-3 py-2.5">
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Preview
            </div>
            <div className="text-[15px] font-semibold tabular-nums mt-0.5">{preview}</div>
          </div>

          <Section title="Regulation & data" />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Regulator">
              <Input value={f.regulator} onChange={(e) => set("regulator", e.target.value.toUpperCase())} placeholder="IRC" />
            </Field>
            <Field label="Regulator full name" className="col-span-2">
              <Input value={f.regulatorName} onChange={(e) => set("regulatorName", e.target.value)} placeholder="Insurance Regulator of Cambodia" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Data residency">
              <Select value={f.residency} onValueChange={(v) => set("residency", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">No restriction</SelectItem>
                  <SelectItem value="preferred">In-region preferred</SelectItem>
                  <SelectItem value="required">In-country required</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Privacy law">
              <Input value={f.dataLaw} onChange={(e) => set("dataLaw", e.target.value)} placeholder="PDP Law 2024" />
            </Field>
            <Field label="Takaful">
              <Select value={f.takaful} onValueChange={(v) => set("takaful", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Not supported</SelectItem>
                  <SelectItem value="true">Supported</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" disabled={!valid} onClick={submit}>
            Create market
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-[11.5px] mb-1.5 flex items-center gap-1.5">
        {label}
        {hint && <span className="text-[10px] font-normal text-muted-foreground">{hint}</span>}
      </Label>
      {children}
    </div>
  );
}
