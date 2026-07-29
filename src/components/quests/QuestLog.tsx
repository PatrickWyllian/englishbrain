"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import {
  useDailyQuests,
  useWeeklyQuests,
  useClaimQuest,
} from "@/hooks/use-quests";

interface QuestItem {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  requirement: { type: string; count?: number; tags?: string[] };
  progress: { current: number; target: number };
  completedAt: string | null;
  claimedAt: string | null;
}

function ProgressRing({
  current,
  target,
}: {
  current: number;
  target: number;
}) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width="52" height="52" className="shrink-0">
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-n-700"
      />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-accent transition-all duration-500"
        transform="rotate(-90 26 26)"
      />
      <text
        x="26"
        y="26"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground text-[10px] font-bold"
      >
        {current}/{target}
      </text>
    </svg>
  );
}

function QuestCard({ quest }: { quest: QuestItem }) {
  const [expanded, setExpanded] = useState(false);
  const claimMutation = useClaimQuest();
  const pct =
    quest.progress.target > 0
      ? Math.round(
          (quest.progress.current / quest.progress.target) * 100,
        )
      : 0;
  const isComplete = !!quest.completedAt;
  const isClaimed = !!quest.claimedAt;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-n-700 bg-n-800/60 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full p-4 text-left"
      >
        <ProgressRing current={quest.progress.current} target={quest.progress.target} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-sm font-semibold text-foreground truncate">
              {quest.title}
            </h4>
            {isClaimed && (
              <Badge variant="success" className="text-[10px]">
                Coletado
              </Badge>
            )}
            {isComplete && !isClaimed && (
              <Badge variant="warning" className="text-[10px]">
                Pronto
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-n-400">
            <Star className="w-3 h-3 text-accent" />
            <span>{quest.xpReward} XP</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-n-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-n-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-3">
              <p className="text-sm text-n-300">{quest.description}</p>
              <Progress value={pct} className="h-1.5" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-n-400">
                  {pct}% concluído
                </span>
                {isComplete && !isClaimed ? (
                  <Button
                    size="sm"
                    onClick={() => claimMutation.mutate(quest.id)}
                    isLoading={claimMutation.isPending}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Coletar
                  </Button>
                ) : isClaimed ? (
                  <span className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    +{quest.xpReward} XP
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-n-400">
                    <Clock className="w-3.5 h-3.5" />
                    {quest.progress.current}/{quest.progress.target}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function QuestLog() {
  const daily = useDailyQuests();
  const weekly = useWeeklyQuests();

  const dailyQuests = (daily.data ?? []) as unknown as QuestItem[];
  const weeklyQuests = (weekly.data ?? []) as unknown as QuestItem[];

  const totalActive = [...dailyQuests, ...weeklyQuests].filter(
    (q) => !q.claimedAt,
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="font-display text-lg font-bold text-foreground">
            Quest Log
          </h3>
        </div>
        {totalActive > 0 && (
          <Badge variant="info">{totalActive} ativas</Badge>
        )}
      </div>

      {dailyQuests.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-n-400">
            Diárias
          </h4>
          {dailyQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}

      {weeklyQuests.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-n-400">
            Semanais
          </h4>
          {weeklyQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}

      {daily.isLoading && weekly.isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-n-800/40 animate-pulse"
            />
          ))}
        </div>
      )}

      {!daily.isLoading &&
        !weekly.isLoading &&
        dailyQuests.length === 0 &&
        weeklyQuests.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Trophy className="w-8 h-8 text-n-600 mx-auto mb-2" />
              <p className="text-sm text-n-400">
                Nenhuma quest disponível no momento
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
