"use client";

import { motion } from "framer-motion";
import { useSkillTreeNodes } from "@/hooks/use-skill-tree";
import { SKILL_NODES, BRANCH_COLORS } from "@/lib/gamification/skill-tree-data";

export function SkillTreeMini() {
  const { nodeMap, isLoading } = useSkillTreeNodes();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-display font-semibold text-sm text-n-200">
          Skill Tree
        </h3>
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="text-n-500 text-xs">Carregando...</div>
        </div>
      </div>
    );
  }

  const activeNodes = SKILL_NODES.filter(n => nodeMap.get(n.id) === "active").slice(0, 3);
  const nextUnlock = SKILL_NODES.find(n => nodeMap.get(n.id) === "available");

  const displayNodes = activeNodes.length > 0
    ? activeNodes
    : nextUnlock
      ? [nextUnlock]
      : SKILL_NODES.slice(0, 3);

  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-sm text-n-200">
        Skill Tree
      </h3>
      <div className="flex items-center justify-center gap-3 py-2">
        {displayNodes.map((node, i) => {
          const state = nodeMap.get(node.id) ?? "locked";
          const color = BRANCH_COLORS[node.branch];

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div
                className={`
                  w-12 h-12 flex items-center justify-center font-display font-bold text-sm
                  clip-hex
                  ${state === "active" ? "text-n-950" : "text-n-300"}
                `}
                style={{
                  backgroundColor: state === "locked" ? "#44403C" : color,
                  boxShadow: state === "available" ? `0 0 12px ${color}` : undefined,
                }}
              >
                {node.name.charAt(0)}
              </div>
              {state === "available" && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
              )}
            </motion.div>
          );
        })}
      </div>
      <p className="text-xs text-n-500 text-center">
        {nextUnlock
          ? `Próximo: ${nextUnlock.name} (${nextUnlock.xpCost} XP)`
          : "Complete lições para desbloquear novos nós."}
      </p>

      <style jsx>{`
        .clip-hex {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
      `}</style>
    </div>
  );
}
