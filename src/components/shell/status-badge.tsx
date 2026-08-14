import { cn } from "@/lib/utils";

export type Status = "success" | "warning" | "danger" | "info" | "neutral";

const styles: Record<Status, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
  info: "bg-info/15 text-info",
  neutral: "bg-muted text-muted-foreground",
};

const dotStyles: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
  neutral: "bg-muted-foreground/60",
};

export function StatusBadge({
  status,
  children,
}: {
  status: Status;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-bold",
        styles[status]
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotStyles[status])} />
      {children}
    </span>
  );
}
