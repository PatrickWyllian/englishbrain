"use client";

import { useState } from "react";
import { Shield, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import {
  getGuildByUser,
  createGuild,
  joinGuild,
  leaveGuild,
} from "@/app/actions/guild";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const GUILD_KEY = ["guild"] as const;

interface GuildMember {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  image: string | null;
  level: number;
  totalXp: string;
}

interface Guild {
  id: string;
  name: string;
  tag: string;
  description: string;
  members: GuildMember[];
}

export function GuildCard() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [guildName, setGuildName] = useState("");
  const [guildTag, setGuildTag] = useState("");
  const [guildDesc, setGuildDesc] = useState("");
  const [joinGuildId, setJoinGuildId] = useState("");

  const guildQuery = useQuery({
    queryKey: GUILD_KEY,
    queryFn: () => getGuildByUser() as Promise<Guild | null>,
  });

  const createMutation = useMutation({
    mutationFn: () => createGuild(guildName, guildTag, guildDesc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUILD_KEY });
      setShowCreate(false);
      setGuildName("");
      setGuildTag("");
      setGuildDesc("");
    },
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => joinGuild(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUILD_KEY });
      setShowJoin(false);
      setJoinGuildId("");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveGuild(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUILD_KEY });
    },
  });

  const guild = guildQuery.data;

  if (guildQuery.isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="h-24 rounded-xl bg-n-800/40 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (guild) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent-secondary" />
              [{guild.tag}] {guild.name}
            </span>
            <Badge variant="secondary">
              {guild.members.length} membros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-n-300">{guild.description}</p>

          <div className="space-y-2">
            {guild.members.slice(0, 10).map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-n-900/30"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={member.avatarUrl ?? member.image ?? undefined}
                  />
                  <AvatarFallback className="text-xs">
                    {(member.name ?? "?")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.name ?? "Adventurer"}
                  </p>
                  <p className="text-xs text-n-400">Nv. {member.level}</p>
                </div>
                <span className="text-xs text-n-500 font-mono">
                  {Number(member.totalXp).toLocaleString()} XP
                </span>
              </div>
            ))}
          </div>

          <Button
            variant="danger"
            size="sm"
            className="w-full"
            onClick={() => leaveMutation.mutate()}
            isLoading={leaveMutation.isPending}
          >
            <LogOut className="w-4 h-4" />
            Sair da Guild
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent-secondary" />
          Guild
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-n-400">
          Crie ou entre em uma guild para competir no ranking semanal.
        </p>

        {!showCreate && !showJoin && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setShowCreate(true)}
            >
              Criar Guild
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowJoin(true)}
            >
              Entrar
            </Button>
          </div>
        )}

        {showCreate && (
          <div className="space-y-2">
            <input
              type="text"
              value={guildName}
              onChange={(e) => setGuildName(e.target.value)}
              placeholder="Nome da guild"
              className="w-full px-3 py-2 rounded-lg bg-n-900 border border-n-700 text-sm text-foreground placeholder:text-n-500 focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              value={guildTag}
              onChange={(e) =>
                setGuildTag(e.target.value.toUpperCase().slice(0, 4))
              }
              placeholder="Tag (máx. 4 caracteres)"
              maxLength={4}
              className="w-full px-3 py-2 rounded-lg bg-n-900 border border-n-700 text-sm text-foreground font-mono tracking-wider placeholder:text-n-500 focus:outline-none focus:border-accent uppercase"
            />
            <textarea
              value={guildDesc}
              onChange={(e) => setGuildDesc(e.target.value)}
              placeholder="Descrição da guild"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-n-900 border border-n-700 text-sm text-foreground placeholder:text-n-500 focus:outline-none focus:border-accent resize-none"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => createMutation.mutate()}
                isLoading={createMutation.isPending}
                disabled={!guildName.trim() || !guildTag.trim()}
              >
                Criar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {showJoin && (
          <div className="space-y-2">
            <input
              type="text"
              value={joinGuildId}
              onChange={(e) => setJoinGuildId(e.target.value)}
              placeholder="ID da guild"
              className="w-full px-3 py-2 rounded-lg bg-n-900 border border-n-700 text-sm text-foreground placeholder:text-n-500 focus:outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => joinMutation.mutate(joinGuildId)}
                isLoading={joinMutation.isPending}
                disabled={!joinGuildId.trim()}
              >
                Entrar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowJoin(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
