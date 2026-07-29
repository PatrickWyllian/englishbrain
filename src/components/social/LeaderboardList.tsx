"use client";

import { Crown, Users, Calendar, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { getLeaderboard } from "@/app/actions/leaderboard";
import { useQuery } from "@tanstack/react-query";

interface LeaderboardEntry {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  image: string | null;
  level: number;
  totalXp: string;
  class: string;
}

const CLASS_LABELS: Record<string, string> = {
  WARRIOR: "Warrior",
  MAGE: "Mage",
  ROGUE: "Rogue",
  CLERIC: "Cleric",
};

function LeaderboardRow({
  entry,
  rank,
  highlight,
}: {
  entry: LeaderboardEntry;
  rank: number;
  highlight: boolean;
}) {
  const medals = ["", "🥇", "🥈", "🥉"];

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
        highlight
          ? "bg-accent/10 border border-accent/30"
          : "bg-n-900/30 hover:bg-n-900/50"
      }`}
    >
      <span className="w-8 text-center font-display font-bold text-n-300">
        {rank <= 3 ? medals[rank] : `#${rank}`}
      </span>
      <Avatar className="w-9 h-9">
        <AvatarImage
          src={entry.avatarUrl ?? entry.image ?? undefined}
        />
        <AvatarFallback className="text-xs">
          {(entry.name ?? "?")[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {entry.name ?? "Adventurer"}
        </p>
        <p className="text-xs text-n-400">
          Nv. {entry.level} · {CLASS_LABELS[entry.class] ?? entry.class}
        </p>
      </div>
      <span className="text-sm font-mono font-semibold text-accent">
        {Number(entry.totalXp).toLocaleString()} XP
      </span>
    </div>
  );
}

export function LeaderboardList({ currentUserId }: { currentUserId?: string }) {
  const globalQuery = useQuery({
    queryKey: ["leaderboard", "global"],
    queryFn: () => getLeaderboard("global") as Promise<LeaderboardEntry[]>,
  });

  const friendsQuery = useQuery({
    queryKey: ["leaderboard", "friends"],
    queryFn: () => getLeaderboard("friends") as Promise<LeaderboardEntry[]>,
  });

  const guildQuery = useQuery({
    queryKey: ["leaderboard", "guild"],
    queryFn: () => getLeaderboard("guild") as Promise<LeaderboardEntry[]>,
  });

  const weeklyQuery = useQuery({
    queryKey: ["leaderboard", "weekly"],
    queryFn: () => getLeaderboard("weekly") as Promise<LeaderboardEntry[]>,
  });

  function renderList(
    data: LeaderboardEntry[] | undefined,
    isLoading: boolean,
  ) {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-n-800/40 animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-sm text-n-400">Nenhum jogador encontrado</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {data.map((entry, i) => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
            rank={i + 1}
            highlight={entry.id === currentUserId}
          />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="global">
          <TabsList className="w-full">
            <TabsTrigger value="global" className="flex-1 gap-1">
              <Globe className="w-3.5 h-3.5" />
              Global
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex-1 gap-1">
              <Users className="w-3.5 h-3.5" />
              Amigos
            </TabsTrigger>
            <TabsTrigger value="guild" className="flex-1 gap-1">
              <Crown className="w-3.5 h-3.5" />
              Guild
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1 gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Semanal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            {renderList(globalQuery.data, globalQuery.isLoading)}
          </TabsContent>
          <TabsContent value="friends">
            {renderList(friendsQuery.data, friendsQuery.isLoading)}
          </TabsContent>
          <TabsContent value="guild">
            {renderList(guildQuery.data, guildQuery.isLoading)}
          </TabsContent>
          <TabsContent value="weekly">
            {renderList(weeklyQuery.data, weeklyQuery.isLoading)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
