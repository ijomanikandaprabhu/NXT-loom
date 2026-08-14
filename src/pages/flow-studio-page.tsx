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
import { ChevronLeft, Lock, Undo2, Redo2, History, Play, Wifi, Plus, MessageSquare, Variable } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shell/status-badge";
import { NodeInspector } from "@/components/canvas/node-inspector";
import { NodePanel } from "@/components/canvas/node-panel";
import { FlowNode } from "@/components/canvas/flow-node";
import { flows } from "@/data/flows";
import { flowGraphs } from "@/data/flow-graphs";
import { recentRuns } from "@/data/node-library";
import type { FlowNodeData } from "@/data/flow-graphs";
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

  // useNodesState only seeds from its initial value, so navigating between
  // flows (same route, different :id) would otherwise keep the previous graph.
  useEffect(() => {
    setNodes(graph?.nodes ?? []);
    setEdges(graph?.edges ?? []);
    setSelected(null);
    setShowRuns(false);
  }, [id, graph, setNodes, setEdges]);

  const onNodeClick = useCallback((_: unknown, node: { data: unknown }) => {
    const data = node.data as FlowNodeData;
    if (data.kind === "group") return;
    setSelected(data);
  }, []);

  const defaultViewport = useMemo(() => ({ x: 40, y: 40, zoom: 0.72 }), []);

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
            <Button variant="outline" size="sm" className="gap-1.5">
              <Lock className="size-3.5" /> Draft (Read Only)
            </Button>
            <Button size="sm">Start Editing</Button>
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
            <Button variant="outline" size="sm">Publish</Button>
            <Button size="sm" className="gap-1.5"><Play className="size-3.5" /> Run Draft</Button>
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
            nodes={nodes}
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

        {selected && <NodeInspector data={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
