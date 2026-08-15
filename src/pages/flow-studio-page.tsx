import { useMemo, useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ChevronLeft, Undo2, Redo2, History, Play, Wifi, Plus, MessageSquare,
  Variable, StepForward, Square, Pause, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shell/status-badge";
import { NodeInspector } from "@/components/canvas/node-inspector";
import { NodePanel } from "@/components/canvas/node-panel";
import { FlowNode } from "@/components/canvas/flow-node";
import { flows } from "@/data/flows";
import { flowGraphs } from "@/data/flow-graphs";
import { recentRuns } from "@/data/node-library";
import type { FlowNodeData } from "@/data/flow-graphs";
import { RunConsole } from "@/components/canvas/run-console";
import { StepInspector } from "@/components/canvas/step-inspector";
import { useFlowRun } from "@/lib/use-flow-run";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const nodeTypes: NodeTypes = {
  custom: FlowNode,
};

export default function FlowStudioPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const flow = flows.find((f) => f.id === id);
  const graph = flowGraphs[id];

  const [nodes, setNodes, onNodesChange] = useNodesState(graph?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph?.edges ?? []);
  const [selected, setSelected] = useState<FlowNodeData | null>(null);
  const [env, setEnv] = useState<"Draft" | "Staging" | "Production">("Draft");
  const [showNodes, setShowNodes] = useState(false);
  const [showRuns, setShowRuns] = useState(false);
  const [version, setVersion] = useState("v1.0.0");
  const [active, setActive] = useState(true);
  const [editingDraft, setEditingDraft] = useState(false);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [selectedStep, setSelectedStep] = useState(0);

  const run = useFlowRun(nodes);
  const inRunMode = run.state !== "idle";

  // useNodesState only seeds from its initial value, so navigating between
  // flows (same route, different :id) would otherwise keep the previous graph.
  useEffect(() => {
    setNodes(graph?.nodes ?? []);
    setEdges(graph?.edges ?? []);
    setSelected(null);
    setShowRuns(false);
    setSelectedStep(0);
  }, [id, graph, setNodes, setEdges]);

  // While running, the inspector follows the executing step.
  useEffect(() => {
    if (run.state === "running" && run.cursor >= 0) setSelectedStep(run.cursor);
  }, [run.state, run.cursor]);

  const onNodeClick = useCallback((_: unknown, node: { data: unknown }) => {
    const data = node.data as FlowNodeData;
    if (data.kind === "group") return;
    setSelected(data);
  }, []);

  const defaultViewport = useMemo(() => ({ x: 40, y: 40, zoom: 0.72 }), []);

  // Reflect run status on the graph so the canvas and console agree.
  const paintedNodes = useMemo(() => {
    if (!inRunMode) return nodes;
    const byId = new Map(run.steps.map((st) => [st.nodeId, st]));
    return nodes.map((n) => {
      const st = byId.get(n.id);
      return st ? { ...n, data: { ...n.data, runStatus: st.status } } : n;
    });
  }, [nodes, run.steps, inRunMode]);

  if (!flow || !graph) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Flow not found.{" "}
        <Link to="/flows" className="text-primary ml-1">
          Back to Flows
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-col gap-2.5 border-b px-4.5 py-2.5 shrink-0 bg-card">
        <button
          onClick={() => navigate("/flows")}
          className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground w-fit"
        >
          <ChevronLeft className="size-3.5" /> All flows
        </button>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-bold text-[15px]">{flow.name}</span>
          <StatusBadge status="success">Active</StatusBadge>

          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {editingDraft ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-warning/15 text-warning px-2.5 py-1.5 text-[11.5px] font-semibold">
                Editing draft
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md border bg-secondary/60 px-2.5 py-1.5 text-[11.5px] text-muted-foreground">
                <Eye className="size-3.5" /> Viewing {version} (read-only)
              </span>
            )}
            <button
              onClick={() => setEditingDraft((v) => !v)}
              className="text-[11.5px] font-semibold text-primary hover:underline cursor-pointer"
            >
              {editingDraft ? "Discard draft" : "Edit Draft"}
            </button>
            <div className="w-px h-5 bg-border" />
            <label className="flex items-center gap-1.5 text-[11.5px] cursor-pointer">
              <Switch checked={active} onCheckedChange={setActive} className="scale-90" />
              Activate
            </label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="border rounded-md px-2 py-1.5 text-[11.5px] bg-background cursor-pointer"
            >
              <option>v1.0.0</option>
              <option>v0.9.2</option>
              <option>v0.9.1</option>
            </select>
            <div className="w-px h-5 bg-border" />
            <span className="flex items-center gap-1.5 text-[11.5px] text-success font-semibold">
              <Wifi className="size-3.5" /> Connected
            </span>
            <div className="flex border rounded-md overflow-hidden">
              {(["Draft", "Staging", "Production"] as const).map((s, i) => (
                <button
                  key={s}
                  onClick={() => setEnv(s)}
                  className={cn(
                    "px-2.5 py-1.5 text-[12px] font-semibold",
                    s === env ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    i > 0 && "border-l"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="icon" className="size-8"><Undo2 className="size-4" /></Button>
            <Button variant="ghost" size="icon" className="size-8"><Redo2 className="size-4" /></Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowRuns((v) => !v)}
              >
                <History className="size-3.5" /> View Runs
              </Button>
              {showRuns && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowRuns(false)} />
                  <div className="absolute right-0 top-full mt-2 z-20 w-[240px] rounded-xl border bg-card shadow-lg overflow-hidden">
                    <div className="px-3.5 py-2.5 border-b text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                      Recent Runs
                    </div>
                    {recentRuns.map((r, i) => (
                      <button
                        key={i}
                        className="w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-secondary transition-colors cursor-pointer border-b last:border-b-0"
                      >
                        <span
                          className={cn(
                            "size-2 rounded-full mt-1.5 shrink-0",
                            r.status === "Completed" ? "bg-success" : r.status === "Cancelled" ? "bg-muted-foreground/50" : "bg-destructive"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[12.5px] font-semibold">
                            {r.label} · {r.when}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {r.status} · {r.duration}
                          </div>
                        </div>
                        {r.latest && (
                          <span className="text-[9px] font-bold uppercase tracking-wide bg-accent text-accent-foreground rounded px-1.5 py-0.5 shrink-0">
                            Latest
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {!inRunMode ? (
              <>
                <Button variant="outline" size="sm">Publish</Button>
                <Button size="sm" className="gap-1.5" onClick={run.start}>
                  <Play className="size-3.5" /> Run Draft
                </Button>
              </>
            ) : (
              <>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold",
                    run.state === "running"
                      ? "bg-info/15 text-info"
                      : run.state === "paused"
                        ? "bg-warning/15 text-warning"
                        : run.state === "complete"
                          ? "bg-success/15 text-success"
                          : "bg-destructive/15 text-destructive"
                  )}
                >
                  <span className={cn("size-1.5 rounded-full bg-current", run.state === "running" && "animate-pulse")} />
                  {run.state === "running" ? "Running" : run.state === "paused" ? "Paused" : run.state === "complete" ? "Complete" : "Failed"}
                </span>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={run.step} disabled={run.state === "complete"}>
                  <StepForward className="size-3.5" /> Step
                </Button>
                {run.state === "running" ? (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={run.pause}>
                    <Pause className="size-3.5" /> Pause
                  </Button>
                ) : (
                  <Button size="sm" className="gap-1.5" onClick={run.resume} disabled={run.state === "complete"}>
                    <Play className="size-3.5" /> Continue
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1.5" onClick={run.stop}>
                  <Square className="size-3.5" /> Stop
                </Button>
                <span className="font-mono text-[11px] rounded-md border bg-secondary/60 px-2 py-1.5 text-muted-foreground">
                  Node: {run.current?.key ?? "—"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-12 shrink-0 border-r bg-card flex flex-col items-center gap-1.5 py-3">
          <button
            onClick={() => setShowNodes((v) => !v)}
            className={cn(
              "size-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
              showNodes ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"
            )}
            title="Add node"
          >
            <Plus className="size-4.5" />
          </button>
          <button className="size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors cursor-pointer" title="Comments">
            <MessageSquare className="size-4" />
          </button>
          <button className="size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors cursor-pointer" title="Variables">
            <Variable className="size-4" />
          </button>
        </div>

        <div className="flex-1 min-w-0 relative">
          {showNodes && <NodePanel onClose={() => setShowNodes(false)} />}
          <ReactFlow
            nodes={paintedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelected(null)}
            nodeTypes={nodeTypes}
            defaultViewport={defaultViewport}
            minZoom={0.3}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="var(--border)" />
            <Controls showInteractive={false} position="bottom-left" />
          </ReactFlow>
          <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 bg-success/15 text-success rounded-full px-3 py-1.5 text-[11.5px] font-bold shadow-sm pointer-events-none">
            Graph is publishable
          </div>
        </div>

        {inRunMode ? (
          <StepInspector step={run.steps[selectedStep]} />
        ) : (
          selected && <NodeInspector data={selected} onClose={() => setSelected(null)} />
        )}
      </div>

      {inRunMode && (
        <RunConsole
          steps={run.steps}
          cursor={run.cursor}
          selectedIndex={selectedStep}
          onSelect={setSelectedStep}
          collapsed={consoleCollapsed}
          onToggle={() => setConsoleCollapsed((v) => !v)}
        />
      )}
    </div>
  );
}
