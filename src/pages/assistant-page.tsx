import { useState } from "react";
import {
  ClipboardList,
  AlertCircle,
  UserCircle2,
  Paperclip,
  Mic,
  ArrowUp,
  Plus,
  BookOpen,
  FileText,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { conversations, type Conversation } from "@/data/conversations";
import { useAuth } from "@/lib/auth";

const chips = [
  { icon: ClipboardList, label: "Items processed yesterday?" },
  { icon: AlertCircle, label: "Items in Require Review status?" },
  { icon: UserCircle2, label: "Show items assigned to me" },
  { icon: BookOpen, label: "What's the maternity waiting period?" },
];

/** Renders *emphasis*, **strong**, and paragraph breaks without a markdown dependency. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((para, pi) => (
        <p key={pi} className={pi > 0 ? "mt-2.5" : undefined}>
          {para.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith("*") && part.endsWith("*")) {
              return <em key={i} className="not-italic font-medium text-foreground">{part.slice(1, -1)}</em>;
            }
            return <span key={i}>{part}</span>;
          })}
        </p>
      ))}
    </>
  );
}

export default function AssistantPage() {
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [active, setActive] = useState<Conversation | null>(null);

  return (
    <div className="flex flex-1 min-h-0">
      <div className="w-[236px] shrink-0 border-r flex flex-col">
        <div className="px-3.5 pt-4 pb-2 text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">
          NXT Loom Assistant
        </div>
        <div className="px-2.5">
          <button
            onClick={() => {
              setActive(null);
              setValue("");
            }}
            className="w-full flex items-center gap-2 rounded-md border px-3 py-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
          >
            <Plus className="size-3.5" /> New Conversation
          </button>
        </div>
        <div className="px-3.5 pt-4 pb-1.5 text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">
          Your Conversations
        </div>
        <ScrollArea className="flex-1 px-2.5">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className={cn(
                "w-full text-left rounded-md px-2.5 py-2 text-[12.5px] mb-0.5 transition-colors cursor-pointer",
                active?.id === c.id
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {c.title}
            </button>
          ))}
        </ScrollArea>
      </div>

      <div className="relative flex-1 min-w-0 flex flex-col overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 34%, color-mix(in oklch, var(--primary) 9%, transparent), transparent 55%)," +
              "radial-gradient(color-mix(in oklch, var(--border) 55%, transparent) 1px, transparent 1px)",
            backgroundSize: "100% 100%, 20px 20px",
          }}
        />

        {active ? (
          <ScrollArea className="relative flex-1 min-h-0">
            <div className="max-w-[720px] mx-auto px-6 py-8 space-y-5">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-[13px] leading-relaxed">
                  {active.question}
                </div>
              </div>
              <div className="flex gap-2.5">
                <LoomMark className="size-7 rounded-lg shrink-0 mt-0.5" inner="size-4" />
                <div className="max-w-[80%] min-w-0">
                  {active.mode === "knowledge" && (
                    <div className="inline-flex items-center gap-1.5 mb-1.5 rounded-full bg-info/15 text-info px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide">
                      <BookOpen className="size-3" /> Answered from policy documents
                    </div>
                  )}
                  <div className="rounded-2xl rounded-bl-md border bg-card px-4 py-3 text-[13px] leading-relaxed text-muted-foreground shadow-sm">
                    <RichText text={active.answer} />
                  </div>
                  {active.sources && (
                    <div className="mt-2 space-y-1">
                      {active.sources.map((s) => (
                        <div
                          key={s}
                          className="inline-flex items-center gap-1.5 mr-2 rounded-md border bg-secondary/50 px-2 py-1 text-[10.5px] text-muted-foreground"
                        >
                          <FileText className="size-3 shrink-0" />
                          <span className="font-mono">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="relative flex-1 flex flex-col items-center justify-center px-6 min-h-0">
            <div className="w-full max-w-[600px] text-center -mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <LoomMark className="mx-auto mb-6" />
              <h1 className="text-[27px] font-bold tracking-tight text-balance">
                Good evening, {user?.name.split(" ")[0] ?? "there"},
              </h1>
              <p className="text-muted-foreground text-[14px] mt-1.5">
                How can I help with your work today?
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-7">
                {chips.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setValue(c.label)}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-[12.5px] font-medium text-muted-foreground shadow-sm transition-all hover:-translate-y-px hover:border-primary/40 hover:text-foreground hover:shadow cursor-pointer"
                  >
                    <c.icon className="size-3.5 text-primary" />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="relative shrink-0 px-6 pb-5 pt-2">
          <div className="w-full max-w-[600px] mx-auto">
            <div className="rounded-2xl border bg-card shadow-sm p-3 transition-shadow focus-within:shadow-md focus-within:border-ring/50">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ask me about your projects, flows, or workspace"
                rows={1}
                className="w-full resize-none bg-transparent outline-none text-[13.5px] px-1.5 py-1 placeholder:text-muted-foreground"
              />
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center gap-1">
                  <button className="size-8 rounded-md flex items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer">
                    <Paperclip className="size-4" />
                  </button>
                  <button className="size-8 rounded-md flex items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer">
                    <Mic className="size-4" />
                  </button>
                </div>
                <button
                  disabled={!value.trim()}
                  className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-3">
              NXT Loom Assistant can make mistakes. Please double check its responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoomMark({
  className,
  inner = "size-8",
}: {
  className?: string;
  inner?: string;
}) {
  return (
    <div
      className={cn(
        "size-14 rounded-2xl bg-primary flex items-center justify-center shadow-md shadow-primary/20",
        className
      )}
    >
      <svg viewBox="0 0 40 40" className={inner} role="img" aria-label="NXT Loom">
        <g fill="none" stroke="var(--primary-foreground)" strokeLinecap="round">
          {[6, 15, 25, 34].map((x) => (
            <line key={`v${x}`} x1={x} y1="2" x2={x} y2="38" strokeWidth="2" opacity="0.4" />
          ))}
          {[6, 15, 25, 34].map((y) => (
            <line key={`h${y}`} x1="2" y1={y} x2="38" y2={y} strokeWidth="2" opacity="0.4" />
          ))}
        </g>
        <circle cx="20" cy="20" r="6.5" fill="var(--primary-foreground)" />
      </svg>
    </div>
  );
}
