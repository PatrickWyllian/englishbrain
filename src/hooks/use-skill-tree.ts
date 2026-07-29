"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { getUserSkillNodes, unlockSkillNode, masterSkillNode } from "@/app/actions/skill-tree";
import { useGameStore } from "@/stores/game-store";
import type { NodeState } from "@/lib/gamification/skill-tree-data";

const SKILL_TREE_KEY = ["skill-tree"] as const;

interface UserSkillNodeData {
  skillId: string;
  status: string;
  progress: number;
}

function toNodeState(status: string): NodeState {
  switch (status) {
    case "MASTERED": return "mastered";
    case "ACTIVE": return "active";
    case "AVAILABLE": return "available";
    default: return "locked";
  }
}

export function useSkillTreeNodes(userId?: string) {
  const query = useQuery({
    queryKey: [...SKILL_TREE_KEY, userId],
    queryFn: () => getUserSkillNodes(userId) as Promise<UserSkillNodeData[]>,
    staleTime: 30_000,
  });

  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeState>();
    if (query.data) {
      for (const node of query.data) {
        map.set(node.skillId, toNodeState(node.status));
      }
    }
    return map;
  }, [query.data]);

  return {
    ...query,
    nodeMap,
    nodes: (query.data ?? []) as UserSkillNodeData[],
  };
}

export function useUnlockSkillNode() {
  const queryClient = useQueryClient();
  const setPlayer = useGameStore((s) => s.setPlayer);

  return useMutation({
    mutationFn: (skillId: string) => unlockSkillNode(skillId),
    onSuccess: (result) => {
      if (result && "node" in result) {
        queryClient.invalidateQueries({ queryKey: SKILL_TREE_KEY });

        const current = useGameStore.getState().player;
        if (current) {
          const skillNode = (result as { node: { skill?: { xpCost?: number } } }).node;
          const xpCost = skillNode?.skill?.xpCost ?? 0;
          const newTotalXp = BigInt(current.totalXp) - BigInt(xpCost);
          const newXp = BigInt(current.xp) - BigInt(xpCost);

          setPlayer({
            ...current,
            xp: newXp.toString(),
            totalXp: newTotalXp.toString(),
          });
        }
      }
    },
    onError: () => {},
  });
}

export function useMasterSkillNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillId: string) => masterSkillNode(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_TREE_KEY });
    },
    onError: () => {},
  });
}
