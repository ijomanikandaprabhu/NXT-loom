import { useState } from "react";
import { Plus, Search, Eye, Copy, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  workspaces,
  agents,
  users,
  roles,
  apiKeys,
  environments,
  variables,
  integrations,
  type UserStatus,
  type VarScope,
} from "@/data/settings-data";
import { markets } from "@/data/locale";
import { cn } from "@/lib/utils";

const tabs = [
  { v: "workspaces", label: "Workspaces" },
  { v: "markets", label: "Markets & Residency" },
  { v: "agents", label: "AI Agents" },
  { v: "integrations", label: "Integrations" },
  { v: "users", label: "Users" },
  { v: "roles", label: "Roles" },
  { v: "keys", label: "API Keys" },
  { v: "environments", label: "Environments" },
  { v: "variables", label: "Variables" },
];

const integrationTone: Record<string, string> = {
  Connected: "bg-success/15 text-success",
  Degraded: "bg-warning/15 text-warning",
  "Not connected": "bg-muted text-muted-foreground",
};

const statusTone: Record<UserStatus, string> = {
  Active: "bg-success/15 text-success",
  Invited: "bg-warning/15 text-warning",
  Disabled: "bg-muted text-muted-foreground",
};

const roleTone: Record<string, string> = {
  PLATFORM_ADMIN: "bg-primary/15 text-primary",
  ADMIN: "bg-info/15 text-info",
  PARTNER: "bg-success/15 text-success",
  REVIEWER: "bg-secondary text-secondary-foreground",
  DEPOT: "bg-warning/15 text-warning",
  ALERT: "bg-destructive/15 text-destructive",
};

const scopeTone: Record<VarScope, string> = {
  Environment: "bg-primary/15 text-primary",
  Workspace: "bg-info/15 text-info",
  "AI Agent": "bg-success/15 text-success",
  Flow: "bg-warning/15 text-warning",
  Global: "bg-secondary text-secondary-foreground",
  Local: "bg-muted text-muted-foreground",
};

export default function SettingsPage() {
  const [userQuery, setUserQuery] = useState("");
  const [env, setEnv] = useState<"prod" | "staging">("prod");
  const [scopeFilter, setScopeFilter] = useState<"All Scopes" | VarScope>("All Scopes");

  const shownUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userQuery.toLowerCase())
  );

  const shownVars = variables.filter(
    (v) => v.env === env && (scopeFilter === "All Scopes" || v.scope === scopeFilter)
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 pt-7 pb-14 max-w-[1120px] mx-auto w-full">
        <h1 className="text-[26px] font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-[13.5px] mt-1">
          Manage your organization settings, users, and resources.
        </p>

        <Tabs defaultValue="workspaces" className="mt-6">
          <TabsList className="bg-transparent border-b rounded-none p-0 h-auto w-full justify-start gap-6 overflow-x-auto">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="cursor-pointer rounded-none border-b-2 border-transparent transition-colors data-[state=active]:border-primary data-[state=active]:shadow-none px-0 pb-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold bg-transparent whitespace-nowrap"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ---------- Workspaces ---------- */}
          <TabsContent value="workspaces" className="mt-5">
            <Panel
              title="Workspaces"
              count={`${workspaces.length} Workspaces`}
              blurb="Manage workspaces for your organization."
              action="Add workspace"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>AI Agents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspaces.map((w) => (
                    <TableRow key={w.id} className="cursor-pointer">
                      <TableCell>
                        <div className="text-[13px] font-semibold">{w.name}</div>
                        <div className="text-[10.5px] text-muted-foreground font-mono mt-0.5">{w.id}</div>
                      </TableCell>
                      <TableCell className="text-[12.5px] text-muted-foreground">{w.org}</TableCell>
                      <TableCell className="text-[12.5px] font-semibold text-primary">
                        {w.agents} AI Agents
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Panel>
          </TabsContent>

          {/* ---------- AI Agents ---------- */}
          <TabsContent value="agents" className="mt-5">
            <Panel
              title="AI Agents"
              count={`${agents.length} AI Agents`}
              blurb="Manage AI Agents for your organization."
              action="Add AI Agent"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>AI Agent</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Created at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((a) => (
                    <TableRow key={a.id} className="cursor-pointer">
                      <TableCell>
                        <div className="text-[13px] font-semibold">{a.name}</div>
                        <div className="text-[10.5px] text-muted-foreground font-mono mt-0.5">{a.id}</div>
                      </TableCell>
                      <TableCell className="text-[12.5px] text-muted-foreground">NXT Loom Demo Org</TableCell>
                      <TableCell className="text-[12.5px]">{a.workspace}</TableCell>
                      <TableCell className="text-[12.5px] font-semibold text-primary">{a.users} Users</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                        {a.created}
                        <div className="text-[10.5px] opacity-70">{a.time}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Panel>
          </TabsContent>

          {/* ---------- Markets & Residency ---------- */}
          <TabsContent value="markets" className="mt-5">
            <Panel
              title="Markets & data residency"
              count={`${markets.length} markets`}
              blurb="Where each market's personal data is stored and processed. Indonesia and Vietnam require in-country storage by law."
              action="Add market"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market</TableHead>
                    <TableHead>Regulator</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Data residency</TableHead>
                    <TableHead>Privacy law</TableHead>
                    <TableHead>Takaful</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {markets.map((m) => (
                    <TableRow key={m.code} className="cursor-pointer">
                      <TableCell>
                        <div className="text-[13px] font-semibold">
                          {m.flag} {m.name}
                        </div>
                        <div className="text-[10.5px] text-muted-foreground mt-0.5">
                          {m.languages.join(" · ")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[12.5px] font-semibold">{m.regulator}</div>
                        <div className="text-[10.5px] text-muted-foreground">{m.regulatorName}</div>
                      </TableCell>
                      <TableCell className="text-[12.5px] font-mono">{m.currency}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-bold",
                            m.residency === "required"
                              ? "bg-destructive/15 text-destructive"
                              : m.residency === "preferred"
                                ? "bg-warning/15 text-warning"
                                : "bg-success/15 text-success"
                          )}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {m.residency === "required"
                            ? "In-country required"
                            : m.residency === "preferred"
                              ? "In-region preferred"
                              : "No restriction"}
                        </span>
                      </TableCell>
                      <TableCell className="text-[11.5px] text-muted-foreground">{m.dataLaw}</TableCell>
                      <TableCell>
                        {m.takaful ? (
                          <span className="rounded-full bg-success/15 text-success px-2 py-0.5 text-[11px] font-semibold">
                            Supported
                          </span>
                        ) : (
                          <span className="text-[11.5px] text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Panel>
          </TabsContent>

          {/* ---------- Integrations ---------- */}
          <TabsContent value="integrations" className="mt-5">
            <Panel
              title="Integrations"
              count={`${integrations.filter((i) => i.status === "Connected").length} of ${integrations.length} connected`}
              blurb="Connect NXT Loom to the systems your flows read from and write to."
              action="Add integration"
            >
              <div className="grid grid-cols-2 gap-3 p-4">
                {integrations.map((i) => (
                  <div key={i.name} className="rounded-xl border p-4">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold truncate">{i.name}</div>
                        <div className="text-[10.5px] text-muted-foreground uppercase tracking-wide mt-0.5">
                          {i.category}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-bold shrink-0",
                          integrationTone[i.status]
                        )}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {i.status}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-2">{i.detail}</p>
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {i.environments.length > 0 ? (
                        i.environments.map((e) => (
                          <span key={e} className="rounded border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                            {e}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10.5px] text-muted-foreground italic">No environments</span>
                      )}
                      <span className="ml-auto text-[10.5px] text-muted-foreground">
                        Checked {i.lastCheck}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>

          {/* ---------- Users ---------- */}
          <TabsContent value="users" className="mt-5">
            <Panel
              title="Users"
              count={`${users.length} Users`}
              blurb="Manage members of your organization."
              action="Add user"
              search={
                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Search users…"
                    className="pl-8 h-9 text-[12.5px]"
                  />
                </div>
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>AI Agents</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shownUsers.slice(0, 40).map((u, i) => (
                    <TableRow key={`${u.email}-${i}`} className="cursor-pointer">
                      <TableCell>
                        <div className="text-[13px] font-semibold">{u.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{u.email}</div>
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-bold", statusTone[u.status])}>
                          <span className="size-1.5 rounded-full bg-current" />
                          {u.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <span key={r} className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide", roleTone[r] ?? "bg-secondary")}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-[12.5px] font-semibold text-primary">
                        {u.agents} {u.agents === 1 ? "AI Agent" : "AI Agents"}
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                        {u.joined}
                        <div className="text-[10.5px] opacity-70">9:00 AM</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {shownUsers.length > 40 && (
                <div className="px-5 py-3 text-[12px] text-muted-foreground border-t">
                  Showing 40 of {shownUsers.length} users
                </div>
              )}
            </Panel>
          </TabsContent>

          {/* ---------- Roles ---------- */}
          <TabsContent value="roles" className="mt-5">
            <Panel title="Roles" count={`${roles.length} Roles`} blurb="Manage roles for your organization." action="Add role">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Created at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer">
                      <TableCell>
                        <div className="text-[12.5px] font-bold tracking-wide">{r.name}</div>
                        <div className="text-[10.5px] text-muted-foreground font-mono mt-0.5">{r.id}</div>
                      </TableCell>
                      <TableCell>
                        <span className={cn("rounded-full px-2.5 py-[3px] text-[11px] font-semibold", r.type === "Global" ? "bg-secondary text-secondary-foreground" : "bg-primary/15 text-primary")}>
                          {r.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-[12.5px] font-semibold text-primary">{r.users} Users</TableCell>
                      <TableCell className="text-[12.5px]">{r.permissions} Permissions</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                        {r.created}
                        <div className="text-[10.5px] opacity-70">{r.time}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Panel>
          </TabsContent>

          {/* ---------- API Keys ---------- */}
          <TabsContent value="keys" className="mt-5">
            <Panel title="API Keys" count={`${apiKeys.length} API Keys`} blurb="Manage API keys for your organization." action="Create API Key">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>API Key</TableHead>
                    <TableHead>Created at</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((k) => (
                    <TableRow key={k.prefix}>
                      <TableCell className="font-mono text-[12px]">
                        <span className="text-foreground">{k.prefix}</span>
                        <span className="text-muted-foreground">{"•".repeat(28)}</span>
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                        {k.created}
                        <div className="text-[10.5px] opacity-70">{k.createdTime}</div>
                      </TableCell>
                      <TableCell className="text-[12px] tabular-nums">
                        {k.expires === "Never" ? (
                          <span className="text-muted-foreground">Never</span>
                        ) : (
                          <>
                            {k.expires}
                            <div className="text-[10.5px] text-muted-foreground opacity-70">{k.expiresTime}</div>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Panel>
          </TabsContent>

          {/* ---------- Environments ---------- */}
          <TabsContent value="environments" className="mt-5">
            <Panel
              title="NXT Loom Demo Org environments"
              count={`${environments.length} Environments`}
              blurb="Manage deployment environments for your secrets and variables."
              action="Create environment"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Variables</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {environments.map((e) => (
                    <TableRow key={e.id} className="cursor-pointer">
                      <TableCell>
                        <div className="text-[13px] font-semibold">{e.name}</div>
                        <div className="text-[10.5px] text-muted-foreground font-mono mt-0.5">{e.id}</div>
                      </TableCell>
                      <TableCell className="text-[12.5px] font-semibold text-primary">{e.variables} Variables</TableCell>
                      <TableCell className="text-[12.5px] text-muted-foreground">{e.description}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                        {e.created}
                        <div className="text-[10.5px] opacity-70">{e.time}</div>
                      </TableCell>
                      <TableCell className="text-[12.5px] text-muted-foreground">—</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Panel>
          </TabsContent>

          {/* ---------- Variables ---------- */}
          <TabsContent value="variables" className="mt-5">
            <div className="border rounded-xl bg-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b flex-wrap">
                <span className="font-semibold text-[14px]">{env} environment variables</span>
                <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border rounded-full px-2 py-0.5">
                  {shownVars.length} Variables
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success bg-success/10 border border-success/25 rounded-full px-2.5 py-1">
                  <ShieldCheck className="size-3" /> End-to-end encryption ready
                </span>
                <Button size="sm" className="ml-auto gap-1.5">
                  <Plus className="size-3.5" /> Add variable
                </Button>
              </div>
              <p className="px-5 py-3 text-[12.5px] text-muted-foreground border-b">
                Manage values for this environment.
              </p>

              <div className="flex items-center gap-2 px-5 py-3 border-b flex-wrap">
                {(["All Scopes", "Environment", "Workspace", "AI Agent", "Flow", "Global", "Local"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScopeFilter(s)}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer",
                      scopeFilter === s
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {s}
                  </button>
                ))}
                <select
                  value={env}
                  onChange={(e) => setEnv(e.target.value as "prod" | "staging")}
                  className="ml-auto border rounded-md px-2.5 py-1.5 text-[12.5px] bg-background cursor-pointer"
                >
                  <option value="prod">prod</option>
                  <option value="staging">staging</option>
                </select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shownVars.map((v) => (
                    <TableRow key={v.ref}>
                      <TableCell>
                        <div className="text-[12.5px] font-semibold font-mono">{v.name}</div>
                        <div className="text-[10.5px] text-muted-foreground font-mono mt-0.5">{v.ref}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[12px] text-muted-foreground">{"•".repeat(16)}</span>
                          <button className="text-muted-foreground hover:text-foreground cursor-pointer"><Eye className="size-3.5" /></button>
                          <button className="text-muted-foreground hover:text-foreground cursor-pointer"><Copy className="size-3.5" /></button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn("rounded-full px-2.5 py-[3px] text-[11px] font-semibold", scopeTone[v.scope])}>
                          {v.scope}
                        </span>
                      </TableCell>
                      <TableCell className="text-[12.5px] tabular-nums">{v.version}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                        {v.created}
                        <div className="text-[10.5px] opacity-70">{v.createdTime}</div>
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                        {v.updated}
                        <div className="text-[10.5px] opacity-70">{v.updatedTime}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Panel({
  title,
  count,
  blurb,
  action,
  search,
  children,
}: {
  title: string;
  count: string;
  blurb: string;
  action: string;
  search?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b flex-wrap">
        <span className="font-semibold text-[14px]">{title}</span>
        <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border rounded-full px-2 py-0.5">
          {count}
        </span>
        <div className="ml-auto flex items-center gap-2.5">
          {search}
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" /> {action}
          </Button>
        </div>
      </div>
      <p className="px-5 py-3 text-[12.5px] text-muted-foreground border-b">{blurb}</p>
      {children}
    </div>
  );
}
