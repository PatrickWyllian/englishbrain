"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import {
  SKILL_NODES,
  BRANCH_COLORS,
  HEX_RADIUS,
  HEX_H_SPACING,
  HEX_V_SPACING,
  hexPath,
  type SkillNodeData,
  type NodeState,
} from "@/lib/gamification/skill-tree-data";
import { useSkillTreeNodes, useUnlockSkillNode } from "@/hooks/use-skill-tree";
import { useGameStore } from "@/stores/game-store";

const BRANCH_COL: Record<string, number> = {
  SPEAKING: 0,
  LISTENING: 1,
  READING: 2,
  WRITING: 3,
  GRAMMAR: 4,
  VOCAB: 5,
};

export function SkillTree() {
  const { nodeMap, nodes, isLoading } = useSkillTreeNodes();
  const unlockMutation = useUnlockSkillNode();
  const player = useGameStore((s) => s.player);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const totalXpNum = player ? Number(player.totalXp) : 0;

  const nodePositions = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>();
    for (const node of SKILL_NODES) {
      const col = BRANCH_COL[node.branch] ?? 0;
      const row = node.tier - 1;
      const baseX = col * HEX_H_SPACING + HEX_RADIUS + 80;
      const baseY = row * HEX_V_SPACING + HEX_RADIUS * 2 + 60;
      pos.set(node.id, { x: baseX, y: baseY + (col % 2 === 1 ? HEX_V_SPACING / 2 : 0) });
    }
    return pos;
  }, []);

  const getNodeState = useCallback(
    (node: SkillNodeData): NodeState => {
      const saved = nodeMap.get(node.id);
      if (saved) return saved;

      const prereqsMet = node.prerequisites.every((pid) => {
        const pState = nodeMap.get(pid);
        return pState === "mastered";
      });

      if (!prereqsMet) return "locked";
      return totalXpNum >= node.xpCost ? "available" : "locked";
    },
    [nodeMap, totalXpNum],
  );

  const handleNodeClick = (node: SkillNodeData) => {
    const state = getNodeState(node);
    if (state === "available") {
      unlockMutation.mutate(node.id);
    }
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((s) => Math.max(0.5, Math.min(2, s + delta)));
    },
    [],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    },
    [offset],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    },
    [isPanning, panStart],
  );

  const handleMouseUp = () => setIsPanning(false);

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const svgWidth = 6 * HEX_H_SPACING + HEX_RADIUS * 2 + 160;
  const svgHeight = 5 * HEX_V_SPACING + HEX_RADIUS * 4 + 120;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[min(70vh,600px)] rounded-2xl border border-n-700 bg-n-900/60">
        <div className="text-n-500 text-sm">Carregando skill tree...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["SPEAKING", "LISTENING", "READING", "WRITING", "GRAMMAR", "VOCAB"] as const).map(
            (branch) => (
              <div key={branch} className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: BRANCH_COLORS[branch] }}
                />
                <span className="text-xs text-n-400">
                  {
                    {
                      SPEAKING: "Speaking",
                      LISTENING: "Listening",
                      READING: "Reading",
                      WRITING: "Writing",
                      GRAMMAR: "Grammar",
                      VOCAB: "Vocab",
                    }[branch]
                  }
                </span>
              </div>
            ),
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            className="rounded-lg p-1.5 text-n-400 hover:bg-n-800 hover:text-n-200 transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="rounded-lg p-1.5 text-n-400 hover:bg-n-800 hover:text-n-200 transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={resetView}
            className="rounded-lg p-1.5 text-n-400 hover:bg-n-800 hover:text-n-200 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-n-700 bg-n-900/60"
        style={{ height: "min(70vh, 600px)" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <TooltipProvider>
          <div
            className="absolute inset-0 transition-transform duration-75"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "top left",
              cursor: isPanning ? "grabbing" : "grab",
            }}
          >
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="overflow-visible"
            >
              {SKILL_NODES.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;
                return node.prerequisites.map((preId) => {
                  const prePos = nodePositions.get(preId);
                  if (!prePos) return null;
                  const isActive =
                    getNodeState(node) !== "locked" &&
                    getNodeState(
                      SKILL_NODES.find((n) => n.id === preId)!,
                    ) !== "locked";

                  return (
                    <line
                      key={`${preId}-${node.id}`}
                      x1={prePos.x}
                      y1={prePos.y}
                      x2={pos.x}
                      y2={pos.y}
                      stroke={isActive ? BRANCH_COLORS[node.branch] : "#44403C"}
                      strokeWidth={isActive ? 2 : 1}
                      strokeDasharray={isActive ? "none" : "4 4"}
                      opacity={isActive ? 0.6 : 0.2}
                    />
                  );
                });
              })}

              {SKILL_NODES.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;
                const state = getNodeState(node);
                const color = BRANCH_COLORS[node.branch];

                const fillOpacity = {
                  locked: 0.1,
                  available: 0.2,
                  active: 0.35,
                  mastered: 0.5,
                }[state];

                const strokeOpacity = {
                  locked: 0.2,
                  available: 0.6,
                  active: 0.8,
                  mastered: 1,
                }[state];

                const hasGlow = state === "available";

                return (
                  <Tooltip key={node.id}>
                    <TooltipTrigger asChild>
                      <g
                        className="cursor-pointer"
                        onClick={() => handleNodeClick(node)}
                      >
                        {hasGlow && (
                          <polygon
                            points={hexPath(pos.x, pos.y, HEX_RADIUS + 6)}
                            fill={color}
                            opacity={0.15}
                            className="animate-pulse"
                          />
                        )}

                        <polygon
                          points={hexPath(pos.x, pos.y, HEX_RADIUS)}
                          fill={color}
                          fillOpacity={fillOpacity}
                          stroke={color}
                          strokeOpacity={strokeOpacity}
                          strokeWidth={state === "mastered" ? 2.5 : 1.5}
                        />

                        <text
                          x={pos.x}
                          y={pos.y - HEX_RADIUS + 18}
                          textAnchor="middle"
                          className="fill-n-500 text-[10px] font-mono select-none"
                          style={{ pointerEvents: "none" }}
                        >
                          T{node.tier}
                        </text>

                        <text
                          x={pos.x}
                          y={pos.y + 6}
                          textAnchor="middle"
                          className="fill-n-200 text-[9px] font-semibold select-none"
                          style={{ pointerEvents: "none" }}
                        >
                          {node.name.length > 10
                            ? node.name.slice(0, 9) + "…"
                            : node.name}
                        </text>

                        {state === "available" && (
                          <text
                            x={pos.x}
                            y={pos.y + 20}
                            textAnchor="middle"
                            className="fill-n-400 text-[8px] font-mono select-none"
                            style={{ pointerEvents: "none" }}
                          >
                            {node.xpCost} XP
                          </text>
                        )}

                        {state === "mastered" && (
                          <text
                            x={pos.x}
                            y={pos.y + 22}
                            textAnchor="middle"
                            className="fill-success text-xs select-none"
                            style={{ pointerEvents: "none" }}
                          >
                            ✓
                          </text>
                        )}
                      </g>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <div className="space-y-1">
                        <p className="font-semibold">{node.name}</p>
                        <p className="text-xs text-n-400">{node.description}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <span
                            className="text-[10px] font-semibold uppercase"
                            style={{ color }}
                          >
                            {node.branch}
                          </span>
                          <span className="text-[10px] text-n-500">Tier {node.tier}</span>
                          <span className="text-[10px] font-mono text-n-400">
                            {node.xpCost} XP
                          </span>
                        </div>
                        {node.prerequisites.length > 0 && (
                          <p className="text-[10px] text-n-500">
                            Pré-requisitos: {node.prerequisites.map(pid => {
                              const prereq = SKILL_NODES.find(n => n.id === pid);
                              return prereq?.name ?? pid;
                            }).join(", ")}
                          </p>
                        )}
                        {state === "locked" && (
                          <p className="text-[10px] text-error">🔒 Bloqueado</p>
                        )}
                        {state === "available" && (
                          <p className="text-[10px] text-accent">
                            ⚡ Clique para desbloquear
                          </p>
                        )}
                        {state === "active" && (
                          <p className="text-[10px] text-info">
                            📖 Em progresso (
                            {Math.round(
                              (nodes.find((n) => n.skillId === node.id)
                                ?.progress ?? 0) * 100,
                            )}
                            %)
                          </p>
                        )}
                        {state === "active" && (
                          <p className="text-[10px] text-n-500">
                            Domine com 80%+ de acerto consolidado
                          </p>
                        )}
                        {state === "mastered" && (
                          <p className="text-[10px] text-success">✅ Dominado</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </svg>
          </div>
        </TooltipProvider>
      </div>

      <div className="flex items-center justify-between text-xs text-n-500">
        <span>
          {
            SKILL_NODES.filter(
              (n) => getNodeState(n) === "mastered",
            ).length
          }{" "}
          / {SKILL_NODES.length} mastered
        </span>
        <span className="font-mono">{totalXpNum.toLocaleString()} XP total</span>
      </div>
    </div>
  );
}
