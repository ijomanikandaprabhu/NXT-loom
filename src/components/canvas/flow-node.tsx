import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Mail,
  Globe,
  Sparkles,
  Code2,
  GitBranch,
  Lightbulb,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlowNodeData, NodeKind } from "@/data/flow-graphs";

const kindStyles: Record<NodeKind, { icon: typeof Mail; color: string; bg: string }> = {
  trigger: { icon: Mail, color: "text-warning", bg: "bg-warning/15" },
  action: { icon: Globe, color: "text-info", bg: "bg-info/15" },
  ai: { icon: Sparkles, color: "text-primary", bg: "bg-primary/15" },
  code: { icon: Code2, color: "text-muted-foreground", bg: "bg-muted" },
  switch: { icon: GitBranch, color: "text-muted-foreground", bg: "bg-muted" },
  insights: { icon: Lightbulb, color: "text-info", bg: "bg-info/15" },
  review: { icon: UserCheck, color: "text-success", bg: "bg-success/15" },
  group: { icon: Code2, color: "text-muted-foreground", bg: "bg-muted" },
};

export function FlowNode({ data, selected }: NodeProps & { data: FlowNodeData }) {
  if (data.kind === "code" && data.subtitle === "for each · body") {
    return (
      <div className="text-[10.5px] font-bold text-muted-foreground/70 uppercase tracking-wide">
        {data.title} <span className="font-normal normal-case">· {data.subtitle}</span>
      </div>
    );
  }

  const style = kindStyles[data.kind];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "w-[168px] rounded-lg border bg-card shadow-sm overflow-hidden text-left",
        selected && "ring-2 ring-primary ring-offset-1"
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-border !border-none !size-2" />
      <Handle type="source" position={Position.Right} className="!bg-border !border-none !size-2" />
      <div className="flex items-center gap-2 px-2.5 py-2">
        <span className={cn("size-6 rounded-md flex items-center justify-center shrink-0", style.bg)}>
          <Icon className={cn("size-3.5", style.color)} />
        </span>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold truncate">{data.title}</div>
          <div className="text-[10.5px] text-muted-foreground truncate font-mono">{data.subtitle}</div>
        </div>
      </div>
    </div>
  );
}
