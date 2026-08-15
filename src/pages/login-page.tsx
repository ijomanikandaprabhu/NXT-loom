import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, Globe, ShieldCheck } from "lucide-react";
import { demoUsers, useAuth, type User } from "@/lib/auth";
import { useOrg } from "@/lib/org-store";
import { cn } from "@/lib/utils";

const roleTone: Record<string, string> = {
  servicer: "bg-info/12 text-info",
  builder: "bg-primary/12 text-primary",
  oversight: "bg-warning/15 text-warning",
  admin: "bg-success/12 text-success",
  producer: "bg-accent text-accent-foreground",
  finance: "bg-secondary text-secondary-foreground",
};

/**
 * Role picker standing in for real authentication.
 *
 * One login for the whole platform: a person is one account, and products are
 * entitlements on it. Two products behind two passwords is two vendors, not a
 * platform — so the sign-in screen is where that promise is kept or broken.
 */
export default function LoginPage() {
  const { signIn } = useAuth();
  const { marketFor } = useOrg();
  const navigate = useNavigate();

  const enter = (u: User) => {
    signIn(u.id);
    navigate("/assistant", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-14 bg-background">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center text-center mb-9">
          <img src="/technxt-mark.svg" alt="" className="size-10 mb-4" />
          <h1 className="text-[26px] font-bold tracking-tight">Sign in to NXT Loom</h1>
          <p className="text-[13.5px] text-muted-foreground mt-1.5 max-w-[430px]">
            Choose a role to sign in as. What you can see and change — and which markets you
            can open — follows from the role, not the page.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {demoUsers.map((u) => {
            const markets = u.markets.map((m) => marketFor(m)).filter(Boolean);
            return (
              <button
                key={u.id}
                onClick={() => enter(u)}
                className={cn(
                  "group text-left rounded-xl border bg-card p-4 flex flex-col gap-3",
                  "hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="size-9 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center text-[12px] font-bold">
                    {u.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold leading-tight truncate">
                      {u.name}
                    </div>
                    <div className="text-[11.5px] text-muted-foreground truncate">{u.title}</div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={cn(
                      "text-[9.5px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5",
                      roleTone[u.base]
                    )}
                  >
                    {u.base}
                  </span>
                  {u.readOnly && (
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 bg-warning/15 text-warning">
                      <Eye className="size-2.5" /> read-only
                    </span>
                  )}
                  {u.bindAuthority && (
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 bg-secondary text-secondary-foreground">
                      <ShieldCheck className="size-2.5" /> bind authority
                    </span>
                  )}
                </div>

                <div className="border-t pt-2.5 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <Globe className="size-3 mt-0.5 shrink-0" />
                  <span className="leading-snug">
                    {markets.length === 6 ? (
                      "All markets"
                    ) : (
                      <>{markets.map((m) => `${m!.flag} ${m!.name}`).join(" · ")}</>
                    )}
                    {u.branch && <span className="block opacity-70">{u.branch} branch</span>}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[11.5px] text-muted-foreground text-center mt-8 max-w-[560px] mx-auto leading-relaxed">
          Prototype sign-in — no password, no server. Access is enforced in the browser only.
          A real deployment carries role and market scope in the session token and checks both
          server-side on every request; UI filtering alone would never satisfy an auditor.
        </p>
      </div>
    </div>
  );
}
