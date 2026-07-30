"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PartyCard } from "@/components/social/PartyCard";
import { GuildCard } from "@/components/social/GuildCard";
import { LeaderboardList } from "@/components/social/LeaderboardList";
import { FriendsList } from "@/components/social/FriendsList";
import { QuestLog } from "@/components/quests/QuestLog";

export default function SocialPage() {
  const router = useRouter();

  return (
    <main className="flex-1 p-4 md:p-8 pb-20 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg p-2 text-n-400 hover:bg-n-800 hover:text-n-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Social
          </h1>
          <p className="text-sm text-n-400">Party, guilds, amigos e quests</p>
        </div>
      </div>

      <Tabs defaultValue="quests" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="quests" className="flex-1">
            Quests
          </TabsTrigger>
          <TabsTrigger value="party" className="flex-1">
            Party
          </TabsTrigger>
          <TabsTrigger value="guild" className="flex-1">
            Guild
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex-1">
            Ranking
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex-1">
            Amigos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quests">
          <QuestLog />
        </TabsContent>

        <TabsContent value="party">
          <PartyCard />
        </TabsContent>

        <TabsContent value="guild">
          <GuildCard />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardList />
        </TabsContent>

        <TabsContent value="friends">
          <FriendsList />
        </TabsContent>
      </Tabs>
    </main>
  );
}
