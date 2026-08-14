import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlowNodeData } from "@/data/flow-graphs";

export function NodeInspector({
  data,
  onClose,
}: {
  data: FlowNodeData;
  onClose: () => void;
}) {
  return (
    <div className="w-[300px] shrink-0 border-l bg-card overflow-auto">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <h3 className="text-[13px] font-bold flex-1 truncate">{data.title}</h3>
        <Button variant="ghost" size="icon" className="size-6" onClick={onClose}>
          <X className="size-3.5" />
        </Button>
      </div>

      <div className="p-4">
        {data.kind === "ai" ? (
          <>
            <Field label="Extraction Prompt" hint="Instruct the model on what fields to extract and how to format them. Use schema-first prompting.">
              <Textarea
                defaultValue={data.prompt}
                rows={5}
                className="text-[12px] font-normal resize-none"
              />
            </Field>

            <Field label="Output Schema" hint="JSON schema describing the shape of the extracted data.">
              <Textarea
                defaultValue={data.schema}
                rows={9}
                className="text-[11px] font-mono resize-none"
              />
            </Field>

            <Field label="Model Name">
              <Select defaultValue={data.model}>
                <SelectTrigger className="w-full text-[12.5px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NXT Extract">NXT Extract</SelectItem>
                  <SelectItem value="NXT Extract Mini">NXT Extract Mini</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </>
        ) : data.kind === "switch" ? (
          <Field label="Branch on" hint="Route to the matching case, or default if none match.">
            <Textarea defaultValue="doc_type" rows={2} className="text-[12px] font-mono resize-none" />
          </Field>
        ) : data.kind === "review" ? (
          <Field label="Assignment" hint="Route to a reviewer queue when confidence is below threshold.">
            <Textarea defaultValue="Assign to: Claims — Adjuster queue" rows={2} className="text-[12px] resize-none" />
          </Field>
        ) : data.kind === "insights" ? (
          <Field label="Briefing template" hint="Summarizes extracted fields and evidence into a narrative for the reviewer.">
            <Textarea defaultValue="Summarize coverage findings, cite policy sections, and flag ambiguous fields for review." rows={4} className="text-[12px] resize-none" />
          </Field>
        ) : (
          <Field label="Configuration">
            <Textarea defaultValue={data.subtitle} rows={3} className="text-[12px] font-mono resize-none" />
          </Field>
        )}

        <div className="flex gap-2 mt-5">
          <Button variant="outline" size="sm" className="flex-1">Test node</Button>
          <Button size="sm" className="flex-1">Save</Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="text-[12px] font-semibold mb-1">{label}</div>
      {hint && <p className="text-[11px] text-muted-foreground mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}
