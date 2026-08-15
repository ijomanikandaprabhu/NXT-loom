import { useEffect, useRef, useState } from "react";
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
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useMarketData } from "@/lib/market-data";
import { askCopilot, suggestedQuestions, type CopilotAnswer } from "@/lib/copilot";

const chips = [
  { icon: AlertCircle, label: "What needs review right now?" },
  { icon: UserCircle2, label: "Show items assigned to me" },
  { icon: ClipboardList, label: "Did any runs fail?" },
  { icon: BookOpen, label: "What products do we sell here?" },
];

type Turn = { question: string; answer: CopilotAnswer };

const rowTone: Record<string, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  default: "text-foreground",
};

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
  const { market } = useI18n();
  const d = useMarketData();
  const [value, setValue] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);

  // Answers are only true for the market they were asked in, so switching
  // market clears the transcript rather than leaving stale figures on screen.
  useEffect(() => {
    setTurns([]);
  }, [market]);

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    const answer = askCopilot(question, {
      marketName: d.info.name,
      marketFlag: d.info.flag,
      currency: d.info.currency,
      regulator: d.info.regulator,
      takaful: Boolean(d.info.takaful),
      userName: user?.name ?? "",
      userTitle: user?.title ?? "",
      items: d.items,
      runs: d.runs,
      products: d.products,
      placements: d.placements,
      reviewers: d.reviewers,
      flowCount: d.flows.length,
    });
    setTurns((t) => [...t, { question, answer }]);
    setValue("");
  };

  return (
    <div className="flex flex-1 min-h-0">
      <div className="w-[236px] shrink-0 border-r flex flex-col">
        <div className="px-3.5 pt-4 pb-2 text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">
          NXT Loom Assistant
        </div>
        <div className="px-2.5">
          <button
            onClick={() => {
              setTurns([]);
              setValue("");
            }}
            className="w-full flex items-center gap-2 rounded-md border px-3 py-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
          >
            <Plus className="size-3.5" /> New Conversation
          </button>
        </div>
        <div className="px-3.5 pt-4 pb-1.5 text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">
          Try asking
        </div>
        <ScrollArea className="flex-1 px-2.5">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              className="w-full text-left rounded-md px-2.5 py-2 text-[12.5px] mb-0.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              {q}
            </button>
          ))}
          <p className="px-2.5 py-3 text-[10.5px] leading-relaxed text-muted-foreground/70">
            Answers read the same data the screens render, scoped to the market you
            have selected.
          </p>
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

        {turns.length > 0 ? (
          <ScrollArea className="relative flex-1 min-h-0">
            <div className="max-w-[720px] mx-auto px-6 py-8 space-y-6">
              {turns.map((t, ti) => (
                <div key={ti} className="space-y-5">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-[13px] leading-relaxed">
                      {t.question}
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <LoomMark className="size-7 rounded-lg shrink-0 mt-0.5" inner="size-4" />
                    <div className="max-w-[80%] min-w-0">
                      <div className="rounded-2xl rounded-bl-md border bg-card px-4 py-3 text-[13px] leading-relaxed text-muted-foreground shadow-sm">
                        <RichText text={t.answer.text} />

                        {t.answer.rows && t.answer.rows.length > 0 && (
                          <div className="mt-3 border-t pt-2.5 space-y-1.5">
                            {t.answer.rows.map((r, ri) => (
                              <div key={ri} className="flex items-baseline justify-between gap-4 text-[12.5px]">
                                <span className="min-w-0 truncate text-foreground">{r.label}</span>
                                {r.value && (
                                  <span className={cn("font-semibold tabular-nums shrink-0", rowTone[r.tone ?? "default"])}>
                                    {r.value}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {t.answer.link && (
                          <Link
                            to={t.answer.link.to}
                            className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-[11.5px] font-medium hover:border-primary/40 hover:text-primary transition-colors"
                          >
                            {t.answer.link.label}
                          </Link>
                        )}
                        {t.answer.sources?.map((src) => (
                          <span
                            key={src}
                            className="inline-flex items-center gap-1.5 rounded-md border bg-secondary/50 px-2 py-1 text-[10.5px] text-muted-foreground"
                            title="Where this answer was read from"
                          >
                            <FileText className="size-3 shrink-0" />
                            <span className="font-mono">{src}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
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
                Ask me about {d.info.flag} {d.info.name} — the queue, runs, products or placements.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-7">
                {chips.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => ask(c.label)}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask(value);
                  }
                }}
                placeholder="Ask about the queue, runs, products or placements"
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
                  onClick={() => ask(value)}
                  disabled={!value.trim()}
                  className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-3">
              Answers are read from this workspace's live data, scoped to {d.info.flag} {d.info.name}.
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
