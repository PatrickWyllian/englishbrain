"use client";

import { useState } from "react";
import { UserPlus, Swords, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import {
  getFriends,
  addFriend,
  removeFriend,
} from "@/app/actions/friends";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const FRIENDS_KEY = ["friends"] as const;

interface FriendEntry {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  image: string | null;
  level: number;
  totalXp: string;
  class: string;
}

export function FriendsList() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const friendsQuery = useQuery({
    queryKey: FRIENDS_KEY,
    queryFn: () => getFriends() as Promise<FriendEntry[]>,
  });

  const addMutation = useMutation({
    mutationFn: (friendEmail: string) => addFriend(friendEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEY });
      setShowAdd(false);
      setEmail("");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (friendId: string) => removeFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEY });
    },
  });

  const friends = (friendsQuery.data ?? []) as FriendEntry[];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-accent" />
            Amigos
          </span>
          {!showAdd && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowAdd(true)}
            >
              <UserPlus className="w-4 h-4" />
              Adicionar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {showAdd && (
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email do amigo"
              className="flex-1 px-3 py-2 rounded-lg bg-n-900 border border-n-700 text-sm text-foreground placeholder:text-n-500 focus:outline-none focus:border-accent"
            />
            <Button
              size="sm"
              onClick={() => addMutation.mutate(email)}
              isLoading={addMutation.isPending}
              disabled={!email.includes("@")}
            >
              Adicionar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAdd(false);
                setEmail("");
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {friendsQuery.isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-n-800/40 animate-pulse"
              />
            ))}
          </div>
        )}

        {!friendsQuery.isLoading && friends.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm text-n-400">
              Nenhum amigo ainda. Adicione alguém pelo email!
            </p>
          </div>
        )}

        {friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-n-900/30"
          >
            <Avatar className="w-9 h-9">
              <AvatarImage
                src={friend.avatarUrl ?? friend.image ?? undefined}
              />
              <AvatarFallback className="text-xs">
                {(friend.name ?? "?")[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {friend.name ?? "Adventurer"}
              </p>
              <p className="text-xs text-n-400">
                Nv. {friend.level} · {Number(friend.totalXp).toLocaleString()} XP
              </p>
            </div>
            <button
              className="p-1.5 rounded-md hover:bg-n-800 transition-colors"
              title="Desafiar 1v1"
            >
              <Swords className="w-4 h-4 text-accent-secondary" />
            </button>
            <button
              onClick={() => removeMutation.mutate(friend.id)}
              className="p-1.5 rounded-md hover:bg-n-800 transition-colors"
              title="Remover"
            >
              <X className="w-4 h-4 text-n-500" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
