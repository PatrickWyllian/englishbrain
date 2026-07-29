"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Copy, Check, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import {
  getPartyByUser,
  createParty,
  joinParty,
  leaveParty,
} from "@/app/actions/party";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PARTY_KEY = ["party"] as const;

interface PartyMember {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    image: string | null;
    level: number;
    totalXp: string;
  };
}

interface Party {
  id: string;
  name: string;
  code: string;
  members: PartyMember[];
}

export function PartyCard() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [partyName, setPartyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const partyQuery = useQuery({
    queryKey: PARTY_KEY,
    queryFn: () => getPartyByUser() as Promise<Party | null>,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createParty(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTY_KEY });
      setShowCreate(false);
      setPartyName("");
    },
  });

  const joinMutation = useMutation({
    mutationFn: (code: string) => joinParty(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTY_KEY });
      setShowJoin(false);
      setJoinCode("");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveParty(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTY_KEY });
    },
  });

  const party = partyQuery.data;

  function handleCopyCode() {
    if (!party) return;
    navigator.clipboard.writeText(party.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (partyQuery.isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="h-24 rounded-xl bg-n-800/40 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (party) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              {party.name}
            </span>
            <Badge variant="info">+10% XP</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-n-900/50">
            <code className="flex-1 text-sm font-mono text-accent tracking-widest">
              {party.code}
            </code>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-md hover:bg-n-800 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-n-400" />
              )}
            </button>
          </div>

          <div className="space-y-2">
            {party.members.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-n-900/30"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={member.user.avatarUrl ?? member.user.image ?? undefined}
                  />
                  <AvatarFallback className="text-xs">
                    {(member.user.name ?? "?")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.user.name ?? "Adventurer"}
                  </p>
                  <p className="text-xs text-n-400">
                    Nv. {member.user.level}
                  </p>
                </div>
              </motion.div>
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
            Sair da Party
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          Party
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-n-400">
          Junte-se a uma party para ganhar +10% XP em todas as lições.
        </p>

        {!showCreate && !showJoin && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setShowCreate(true)}
            >
              Criar Party
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowJoin(true)}
            >
              Entrar com Código
            </Button>
          </div>
        )}

        {showCreate && (
          <div className="space-y-2">
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="Nome da party"
              className="w-full px-3 py-2 rounded-lg bg-n-900 border border-n-700 text-sm text-foreground placeholder:text-n-500 focus:outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => createMutation.mutate(partyName)}
                isLoading={createMutation.isPending}
                disabled={!partyName.trim()}
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
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Código (6 caracteres)"
              maxLength={6}
              className="w-full px-3 py-2 rounded-lg bg-n-900 border border-n-700 text-sm text-foreground font-mono tracking-widest placeholder:text-n-500 focus:outline-none focus:border-accent uppercase"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => joinMutation.mutate(joinCode)}
                isLoading={joinMutation.isPending}
                disabled={joinCode.length !== 6}
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
