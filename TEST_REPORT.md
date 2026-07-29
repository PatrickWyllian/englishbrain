# Relatório de Testes - EnglishQuest

**Data:** 2026-07-29  
**QA Engineer:** QA-Engineer  
**Ambiente:** Next.js 16.2.12 (Turbopack) + TypeScript + Prisma + PostgreSQL

---

## Resumo Executivo

| Verificação | Status | Erros | Warnings |
|---|---|---|---|
| TypeScript (`tsc --noEmit`) | PASS | 0 | 0 |
| Build (`npm run build`) | PASS* | 0 | 2 |
| Lint (`npm run lint`) | FAIL | 39 | 30 |
| Estrutura de Arquivos | PASS | 0 | 0 |
| Imports | PASS | 0 | 0 |
| Schema Prisma | PASS | 0 | 0 |

\* Build concluiu com sucesso, mas com warnings importantes.

---

## 1. Verificação TypeScript

**Status: PASS**

Nenhum erro de TypeScript encontrado. O comando `npx tsc --noEmit` foi executado sem erros.

---

## 2. Verificação de Build

**Status: PASS (com warnings)**

O build foi concluído com sucesso (`✓ Compiled successfully`). Porém, 2 warnings foram gerados:

### Warnings do Build

1. **Deprecation do Middleware**: O arquivo `src/middleware.ts` usa o padrão "middleware" que está deprecated. Deve ser migrado para "proxy".
   - Arquivo: `src/middleware.ts`
   - Referência: https://nextjs.org/docs/messages/middleware-to-proxy

2. **Módulos Node.js no Edge Runtime**: O Prisma Client importa `node:path` e `node:url` que não são suportados no Edge Runtime.
   - Arquivo: `src/generated/prisma/client.ts:14-15`
   - Trace: `src/middleware.ts` → `src/lib/prisma.ts` → `src/generated/prisma/client.ts`

---

## 3. Verificação de Lint

**Status: FAIL — 39 erros, 30 warnings**

### Erros Críticos (39)

#### 3.1 Hooks Rules violations (react-hooks/rules-of-hooks)
| Arquivo | Linha | Problema |
|---|---|---|
| `src/hooks/use-consumables.ts` | 58 | `useConsumable` chamado dentro de `mutationFn` (não é componente nem hook) |
| `src/lib/pwa.ts` | 6 | `useEffect` chamado dentro de `registerServiceWorker` (não é componente nem hook) |

#### 3.2 setState dentro de useEffect (react-hooks/set-state-in-effect) — 8 ocorrências
| Arquivo | Linha | Código problemático |
|---|---|---|
| `src/app/[locale]/learn/[slug]/page.tsx` | 20 | `setLesson(found)` |
| `src/app/[locale]/learn/page.tsx` | 72 | `setMounted(true)` |
| `src/app/[locale]/onboarding/page.tsx` | 68 | `setMounted(true)` |
| `src/components/gamification/LevelUpModal.tsx` | 39 | `setShowFlash(true)` |
| `src/components/srs/ReviewQueue.tsx` | 79 | `setIsComplete(true)` |
| `src/components/ui/Confetti.tsx` | 41 | `setParticles(...)` |
| `src/hooks/use-recent-loot.ts` | 20 | `setLoot(JSON.parse(raw))` |
| `src/hooks/use-srs-worker.ts` | 42 | `setIsReady(false)` |

#### 3.3 Uso de `any` explícito (no-explicit-any) — 14 ocorrências
| Arquivo | Linhas |
|---|---|
| `src/app/[locale]/inventory/page.tsx` | 91, 507, 584 |
| `src/app/actions/crafting.ts` | 15, 61 |
| `src/app/actions/inventory.ts` | 187, 197, 209, 222, 223 |
| `src/app/actions/quests.ts` | 201, 207 |
| `src/app/actions/user.ts` | 123 |
| `src/components/inventory/CraftingPanel.tsx` | 136 |
| `src/components/lesson/SpeakingStep.tsx` | 29, 30, 46 |
| `src/hooks/use-crafting.ts` | 23 |

#### 3.4 Violação de Imutabilidade (react-hooks/immutability)
| Arquivo | Linha | Problema |
|---|---|---|
| `src/components/lesson/BossStep.tsx` | 26 | `finish` acessada antes da declaração |

#### 3.5 Uso de `<a>` ao invés de `<Link>` — 6 ocorrências
| Arquivo | Linha |
|---|---|
| `src/app/[locale]/auth/login/page.tsx` | 157 |
| `src/app/[locale]/auth/register/page.tsx` | 166 |
| `src/app/[locale]/page.tsx` | 25, 31 |

#### 3.6 Função impura durante render (react-hooks/purity) — 2 ocorrências
| Arquivo | Linha | Problema |
|---|---|---|
| `src/components/onboarding/PlacementTest.tsx` | 155 | `Date.now()` chamado durante render |
| `src/components/ui/Confetti.tsx` | 68 | `Math.random()` chamado durante render |

### Warnings (30)

#### Imports não utilizados (no-unused-vars) — 20 ocorrências
| Arquivo | Variáveis não usadas |
|---|---|
| `src/app/[locale]/inventory/page.tsx` | `Flame`, `Trophy`, `Quote`, `craftMutation` |
| `src/app/[locale]/social/page.tsx` | `Button` |
| `src/components/gamification/LevelUpModal.tsx` | `Trophy` |
| `src/components/gamification/SkillTreeFull.tsx` | `motion`, `AnimatePresence`, `selectedNode` |
| `src/components/gamification/StreakFlame.tsx` | `motion` |
| `src/components/inventory/CraftingPanel.tsx` | `X`, `Loader2` |
| `src/components/layout/AppNav.tsx` | `BookOpen` |
| `src/components/lesson/BossStep.tsx` | (dependência `finish` no useEffect) |
| `src/components/lesson/ReadingStep.tsx` | `FileText`, `isLast` |
| `src/components/lesson/SpeakingStep.tsx` | `useRef`, `MicOff` |
| `src/components/lesson/WritingStep.tsx` | `setScores` |
| `src/components/onboarding/PlacementTest.tsx` | `useMemo`, `TIME_LIMIT_MS`, `startTime` |
| `src/components/quests/QuestLog.tsx` | `CardHeader`, `CardTitle` |
| `src/components/social/LeaderboardList.tsx` | `Badge` |
| `src/components/ui/Button.tsx` | `props` |
| `src/components/ui/Card.tsx` | `props` |
| `src/hooks/use-skill-tree.ts` | `addXp` |
| `src/stores/game-store.ts` | `xpNeeded` |

#### Dependências incompletas no useEffect (exhaustive-deps) — 2 ocorrências
| Arquivo | Linha |
|---|---|
| `src/components/lesson/BossStep.tsx` | 31 |
| `src/hooks/use-srs-worker.ts` | 73 |

---

## 4. Estrutura de Arquivos

**Status: PASS**

### Páginas Verificadas
| Página | Status |
|---|---|
| `src/app/[locale]/onboarding/page.tsx` | OK |
| `src/app/[locale]/dashboard/page.tsx` | OK |
| `src/app/[locale]/learn/page.tsx` | OK |
| `src/app/[locale]/skill-tree/page.tsx` | OK |
| `src/app/[locale]/inventory/page.tsx` | OK |
| `src/app/[locale]/social/page.tsx` | OK |
| `src/app/[locale]/admin/page.tsx` | OK |

### Componentes Verificados
| Componente | Caminho | Status |
|---|---|---|
| DashboardHero | `src/components/gamification/DashboardHero.tsx` | OK |
| SkillTreeFull | `src/components/gamification/SkillTreeFull.tsx` | OK |
| ReviewQueue | `src/components/srs/ReviewQueue.tsx` | OK |
| LessonShell | `src/components/lesson/LessonShell.tsx` | OK |
| QuestLog | `src/components/quests/QuestLog.tsx` | OK |

### Server Actions Verificados
| Action | Caminho | Status |
|---|---|---|
| user | `src/app/actions/user.ts` | OK |
| skill-tree | `src/app/actions/skill-tree.ts` | OK |
| srs | `src/app/actions/srs.ts` | OK |
| quests | `src/app/actions/quests.ts` | OK |
| party | `src/app/actions/party.ts` | OK |
| guild | `src/app/actions/guild.ts` | OK |
| inventory | `src/app/actions/inventory.ts` | OK |
| crafting | `src/app/actions/crafting.ts` | OK |

### Hooks Verificados
| Hook | Caminho | Status |
|---|---|---|
| use-skill-tree | `src/hooks/use-skill-tree.ts` | OK |
| use-srs | `src/hooks/use-srs.ts` | OK |
| use-inventory | `src/hooks/use-inventory.ts` | OK |
| use-quests | `src/hooks/use-quests.ts` | OK |
| use-consumables | `src/hooks/use-consumables.ts` | OK |
| use-crafting | `src/hooks/use-crafting.ts` | OK |

---

## 5. Verificação de Imports

**Status: PASS**

- **Dependências circulares:** Nenhuma encontrada (verificado com `madge --circular`).
- **Imports com `@/` alias:** Todos os imports no código fonte usam corretamente o alias `@/`.
- **Imports relativos:** Apenas imports entre arquivos dentro do mesmo módulo (ex: `./routing`, `./LootCard`, `./XPBar`) — padrão aceitável.
- **Imports ausentes:** Nenhum encontrado.

---

## 6. Schema Prisma

**Status: PASS**

### Enums (10)
- Role, ClassType, NodeStatus, SkillBranch, ContentType, Level, StepType, ItemType, Rarity, QuestType

### Models (16)
- Account, User, Session, VerificationToken, SkillNode, UserSkillNode, SrsCard, Lesson, LessonStep, SkillReward, LootTable, LootDrop, Item, InventoryItem, EquippedItem, Quest, UserQuest, Party, PartyMember, Guild, Friend

### Relações
Todas as relações estão definidas corretamente:
- User → Account (1:N, cascade delete)
- User → Session (1:N, cascade delete)
- User → SkillNode (N:N via UserSkillNode)
- User → InventoryItem (N:N via Item)
- User → EquippedItem (N:N via Item)
- User → SrsCard (1:N)
- User → UserQuest (N:N via Quest)
- User → PartyMember (N:N via Party)
- User → Guild (N:1, opcional)
- Lesson → LessonStep (1:N, cascade delete)
- Lesson → SkillReward (1:N, cascade delete)
- Lesson → LootTable (1:1, cascade delete)
- LootTable → LootDrop (1:N, cascade delete)
- Item → LootDrop (1:N)
- Quest → UserQuest (1:N)
- Party → PartyMember (1:N, cascade delete)
- Guild → User (1:N)

### Índices
- `UserSkillNode`: @@unique([userId, skillId]), @@index([userId])
- `SrsCard`: @@index([userId, dueDate])
- `LessonStep`: @@index([lessonId])
- `InventoryItem`: @@unique([userId, itemId])
- `EquippedItem`: @@unique([userId, slot])
- `UserQuest`: @@unique([userId, questId])
- `PartyMember`: @@unique([userId]), @@unique([userId, partyId])

---

## 7. Recomendações

### Prioridade Alta
1. **Corrigir `react-hooks/rules-of-hooks`** em `src/hooks/use-consumables.ts:58` e `src/lib/pwa.ts:6` — Violação das regras dos hooks do React pode causar comportamento inesperado.

2. **Corrigir `react-hooks/immutability`** em `src/components/lesson/BossStep.tsx:26` — `finish` é acessada antes da sua declaração. Reordenar o código ou extrair a função para um `useCallback`.

3. **Migrar `middleware` para `proxy`** — O padrão middleware está deprecated no Next.js 16.

### Prioridade Média
4. **Resolver `node:path`/`node:url` no Edge Runtime** — Configurar `next.config.ts` para evitar que o Prisma Client seja bundlado no Edge, ou usar `serverExternalPackages`.

5. **Remover `any` explícito** — Substituir por tipos adequados em 14 ocorrências.

6. **Corrigir `react-hooks/set-state-in-effect`** — 8 ocorrências. Em muitos casos, usar `useMemo` ou reestruturar o código para evitar setState dentro de useEffect.

7. **Substituir `<a>` por `<Link>`** — 6 ocorrências nas páginas de auth e home.

### Prioridade Baixa
8. **Remover imports não utilizados** — 20 warnings de variáveis importadas mas não usadas.

9. **Corrigir `react-hooks/purity`** — Usar `useRef` para valores como `Date.now()` e `Math.random()` que não devem ser chamados durante render.

10. **Completar dependências do useEffect** — Adicionar dependências faltantes ou remover o hook se não for necessário.
