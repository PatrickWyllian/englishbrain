# PLAN.md — EnglishQuest Implementation Plan

## Project Overview
**EnglishQuest** — Gamified English learning web app with contextualized lessons (The Office, Friends, Tech, Business, Travel) and RPG progression (XP, levels, skill tree, loot, streaks).

**Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Prisma + NextAuth + Framer Motion + Zustand + TanStack Query

**Target:** MVP completo em ~10 semanas (2.5 meses)

---

## Phase 0: Foundation (1 semana)

### Objetivo
Setup completo do projeto: Next.js, Tailwind, shadcn/ui, Prisma, Auth, Design tokens, CI/CD. Dashboard vazio funcional.

### Tasks
- [ ] `npx create-next-app@latest english-quest --ts --tailwind --eslint --app --src-dir --import-alias @/* --use-npm`
- [ ] Install dependencies:
  - UI: `@radix-ui/react-*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`
  - State: `zustand`, `@tanstack/react-query`, `@tanstack/react-query-devtools`
  - Forms: `react-hook-form`, `@hookform/resolvers`, `zod`
  - Auth: `next-auth@beta`, `@auth/prisma-adapter`
  - DB: `prisma`, `@prisma/client`
  - Animation: `framer-motion`
  - Charts: `recharts`
  - i18n: `next-intl`
  - Utils: `date-fns`, `nanoid`, `superjson`
  - Dev: `vitest`, `@playwright/test`, `@storybook/nextjs`, `chromatic`
- [ ] Setup shadcn/ui: `npx shadcn@latest init` + add components (button, card, dialog, toast, avatar, badge, progress, tabs, tooltip, dropdown-menu, scroll-area, separator, skeleton, switch)
- [ ] Configure Tailwind design tokens sync com DESIGN.md (CSS variables + theme.extend)
- [ ] Setup Prisma schema (models do DESIGN.md §Technical Architecture)
- [ ] Setup NextAuth v5 (Credentials + Google + GitHub)
- [ ] Configure next-intl (pt-BR default, en-US)
- [ ] Setup GitHub Actions CI (lint, typecheck, test, build)
- [ ] Deploy to Vercel (preview + prod)
- [ ] Create base layout: App Shell (Providers: Auth, Theme, Query, XP, Streak, QuestLog)

### Exit Criteria
- `npm run dev` mostra landing page + login funcional + dashboard vazio com providers
- Lighthouse >90 em todos os scores
- Zero TypeScript errors
- CI passing

---

## Phase 1: Core Loop (2 semanas)

### Objetivo
Onboarding completo + primeira lição jogável (The Office) + XP/Level/Streak persistidos + Dashboard hero.

### Tasks
#### Week 1: Onboarding & Placement
- [ ] Landing page com mascote "Quest" animado
- [ ] Interest Picker: tag cloud multi-select (Séries, Tech, Negócios, Viagem, Games, Cultura Pop, Ciência) + search
- [ ] Placement Test: adaptive, 10-15 min, SRS seeding
  - [ ] Vocab recognition (image + audio)
  - [ ] Grammar multiple choice
  - [ ] Listening comprehension
  - [ ] Reading comprehension
  - [ ] Resultado: nível CEFR + SRS cards iniciais
- [ ] Class Selection: 4 cards (Warrior=Speaking, Mage=Writing, Rogue=Listening, Cleric=Reading) — afeta starter nodes apenas
- [ ] First Lesson guided: garante level 2 + primeiro loot drop

#### Week 2: Lesson Engine & Dashboard
- [ ] LessonShell component: header (XP/mana), progress steps, content slot, result screen
- [ ] Lição "The Office - Business Meeting" (B1):
  - [ ] Vocab cards (8 palavras) com SRS + áudio + contexto da série
  - [ ] Grammar tooltip inline ("going to" for plans)
  - [ ] Listening challenge (áudio + perguntas)
  - [ ] Speaking challenge (Web Speech API + scoring)
  - [ ] Boss challenge (5 perguntas, timer, bonus XP)
- [ ] XP/Level/Streak persistence (Server Actions + Prisma)
- [ ] DashboardHero: Avatar + Level + XP Bar animado + Streak Flame + Mana
- [ ] NextQuestCard: CTA principal context-aware
- [ ] LootDropToast: bottom-right animated drop
- [ ] Level-up animation: flash + confetti + loot drop modal

### Exit Criteria
- Usuário novo: signup → onboarding → placement → class → primeira lição → level up → loot drop → dashboard
- XP, level, streak persistem entre sessões
- Dashboard mostra estado atual corretamente

---

## Phase 2: Skill Tree & SRS (2 semanas)

### Objetivo
Skill tree hexagonal navegável + SRS review queue funcional + 6 branches + unlock logic + progress sync.

### Tasks
#### Week 1: Skill Tree
- [ ] SkillNode component: hexágono 48px, 4 states (locked/available/active/mastered), glow animation, tooltip
- [ ] SkillTree component: hex grid, zoom/pan (react-zoom-pan-pinch), branch colors
- [ ] 6 branches: Speaking, Listening, Reading, Writing, Grammar, Vocab
- [ ] 5 tiers per branch (25-30 nodes total)
- [ ] Position calculation (hex coordinates → SVG positions)
- [ ] Unlock logic: gasta XP, pré-requisitos mastered
- [ ] SkillTreeMini no dashboard: 3 nós ativos + próximo unlock preview
- [ ] Persist user skill nodes no banco

#### Week 2: SRS Review Queue
- [ ] SRS Engine (Web Worker): SM-2 adaptado, client-side, zero latency
- [ ] SrsCard model + sync server (TanStack Query mutation + invalidation)
- [ ] ReviewQueue component: Anki-style, gamificado (XP por review, streak bonus)
- [ ] 4 buttons: Again (0), Hard (1), Good (2), Easy (3)
- [ ] Due date calculation + next review scheduling
- [ ] /learn/review page: queue + stats (due today, learning, mature)
- [ ] Integration: lições geram SrsCards; reviews dão XP + skill progress

### Exit Criteria
- Skill tree totalmente navegável no desktop/mobile (zoom/pan)
- Nós desbloqueados gastando XP, pré-requisitos respeitados
- Review queue funciona offline-first, sincroniza ao reconectar
- XP de reviews aparece no dashboard e skill tree

---

## Phase 3: Loot & Inventory (1.5 semanas)

### Objetivo
Loot tables, drops animados, inventário, equipamento cosmético, crafting básico.

### Tasks
- [ ] Item model + LootTable + LootDrop (weighted random por nível)
- [ ] Rarity system: Common (cinza), Uncommon (verde), Rare (azul), Epic (roxo), Legendary (dourado/roxo)
- [ ] LootCard component: flip 3D animation, rarity border gradient, hover effects
- [ ] LootDropToast: aparece no canto inferior direito, auto-dismiss 4s, clicável → inventory
- [ ] Inventory page: grid filterable (Equipped, Consumables, Collectibles, Materials)
- [ ] Equipped slots: Frame, Title, Pet, Weapon (cosmetic stats only)
- [ ] Consumables: XP Boost (1.5x, 1h), Streak Freeze, Mana Potion (+50 mana)
- [ ] Collectibles: Badges, Scene Cards (quotes da série), Achievements
- [ ] Crafting: Combine 3 Common → 1 Rare (material sink)
- [ ] Equip/unequip Server Actions + optimistic UI
- [ ] Loot drops integrados no lesson result screen

### Exit Criteria
- Ao terminar lição: loot drop aparece no toast → vai pro inventário → pode equipar frame/título
- Rarity visual distinguível, animações suaves
- Crafting funciona, consome materiais

---

## Phase 4: Quests & Social (2 semanas)

### Objetivo
Daily/weekly quests, party system (2-4), guilds, leaderboards, friend challenges.

### Tasks
#### Week 1: Quests & Party
- [ ] Quest model: DAILY, WEEKLY, EVENT, MAIN
- [ ] Quest requirements JSON: `{type: "LESSONS_COMPLETED", count: 3, tags: ["business"]}`
- [ ] QuestLog component: expandable cards, progress rings, claim rewards
- [ ] Daily quests: 3 por dia (rotativas), reset 00:00 UTC
- [ ] Weekly quest: 1 por semana, XP maior, loot melhor
- [ ] Party system: create/join via invite code (6 chars), 2-4 players
- [ ] Party bonus: +10% XP shared, party chat simples
- [ ] Party persistence: reconecta ao reload

#### Week 2: Guilds, Leaderboards, Friends
- [ ] Guild model: name, tag, description, max 50 members
- [ ] Guild weekly quest: progresso compartilhado, recompensa para todos
- [ ] Guild chat: mensagens simples, mentions
- [ ] Leaderboards: Global, Friends, Guild, Weekly (TanStack Query + caching)
- [ ] Friend system: add by username/email, challenge 1v1 (lesson race), gift loot
- [ ] Social page: tabs (Party, Guild, Friends, Leaderboards)
- [ ] Notifications: quest complete, party invite, friend request, guild invite

### Exit Criteria
- Party criada → convida amigos → +10% XP funciona
- Guild quest semanal aparece, progresso compartilhado
- Leaderboard atualiza near real-time
- Friend challenge 1v1: ambos fazem mesma lição, compara XP

---

## Phase 5: Content Pipeline (2 semanas)

### Objetivo
Admin CMS para criar lições, 50+ lições prontas (The Office, Friends, Tech, Travel, Business), tag system, level balancing.

### Tasks
#### Week 1: Admin CMS + Authoring Tool
- [ ] Admin routes (protegidas por role ADMIN)
- [ ] Lesson Editor: form multi-step (metadata → steps → rewards → loot)
- [ ] Step editors por tipo:
  - VOCAB: word list + audio upload + context examples
  - GRAMMAR: point + explanation + examples + contrast tip
  - LISTENING: audio upload + transcript + questions
  - SPEAKING: prompt + target sentences + scoring weights
  - READING: text + questions
  - WRITING: prompt + rubric (future: AI feedback)
  - BOSS: question count + time limit + pass threshold
- [ ] Tag autocomplete (contextTags) + level selector (A1-C2)
- [ ] Skill reward mapper: dropdown de skillIds + XP amounts
- [ ] Loot table editor: drag-drop items + weight + min/max level
- [ ] Preview mode: joga lição no editor
- [ ] Publish/draft workflow

#### Week 2: Content Production (50+ lições)
- [ ] **The Office** (10 lições): A2-B2, business meetings, small talk, emails, presentations, humor
- [ ] **Friends** (10 lições): A2-B1, conversas casuais, phrasal verbs, cultura US, relacionamentos
- [ ] **Tech/Dev** (10 lições): B1-C1, standups, code reviews, docs, debugging, architecture discussions
- [ ] **Travel** (10 lições): A1-B1, aeroporto, hotel, restaurantes, direções, emergências
- [ ] **Business English** (10 lições): B1-C1, negociação, networking, apresentações, emails formais, liderança
- [ ] Balanceamento: XP rewards, mana costs, loot weights por nível
- [ ] Tag coverage: cada tag tem lições A1-C1
- [ ] Recommendation engine: "Based on your tags: The Office + Tech → sugerir lições com ambas tags"

### Exit Criteria
- Admin cria lição completa em <10 minutos
- 50+ lições publicadas, balanceadas, testadas
- Recomendações personalizadas funcionando no dashboard

---

## Phase 6: Polish & Launch (1.5 semanas)

### Objetivo
Animações refinadas, mascot falas, accessibility audit, PWA, error boundaries, analytics, load test.

### Tasks
- [ ] **Mascot polish**: idle breathing, celebrate (level up), think (grammar tooltip), speak (speaking challenge)
- [ ] **Micro-interactions**: button press, card hover, XP bar fill, streak flame flicker, mana pulse
- [ ] **Accessibility audit**: axe-core CI + manual keyboard/screen reader (NVDA/VoiceOver)
  - Focus order lógico
  - ARIA labels em todos os controles custom
  - Reduced motion desliga animações não-essenciais
  - Contraste 4.5:1 body, 3:1 UI
- [ ] **PWA**: manifest, service worker (offline SRS review), install prompt
- [ ] **Error boundaries**: por rota + global, Sentry integration
- [ ] **Analytics** (PostHog): funil onboarding, lesson completion, streak retention D1/D7/D30, feature usage
- [ ] **Load test** (k6): 1k concurrent users, dashboard + lesson complete
  - Target: p95 < 500ms API, < 2s page load
- [ ] **Performance**: bundle analysis, code splitting, image optimization, font loading
- [ ] **SEO**: sitemap, robots.txt, meta tags, structured data
- [ ] **Legal**: Terms, Privacy, Cookie policy (LGPD/GDPR)
- [ ] **Launch checklist**: feature flags, rollback plan, monitoring alerts, on-call rotation

### Exit Criteria
- Lighthouse >90 (Performance, Accessibility, Best Practices, SEO)
- Zero a11y violations (axe-core)
- PWA installável, offline SRS funcional
- Load test passing
- Sentry + PostHog recebendo dados
- Documentação de deploy + rollback pronta

---

## Implementado: Professor / IA (Mestre-Coruja)

> Feature concluída em jul/2026. Usa LLMs configuráveis por usuário para gerar quests e corrigir respostas.

### O que foi entregue
- **Skill do professor**: `content/prompts/teacher.md` — identidade Mestre-Coruja, 7 princípios pedagógicos (i+1, contexto real, produção > perfeição, repetição espaçada, recall ativo, microlearning, transferência), progressão CEFR A1–C2, template de quest em 6 passos, formato de feedback (validar → versão nativa → porquê → pista), mecânicas de dopamina, guardrails e JSON de saída.
- **Provedores LLM** (`src/lib/teacher/providers.ts`): NVIDIA (`integrate.api.nvidia.com`, modelo padrão `nvidia/nemotron-3-ultra`), OpenRouter, Groq, Custom (baseURL editável). Sem SDK — `fetch` OpenAI-compatível (`/v1/chat/completions`) com timeout e extração de JSON + validação Zod.
- **Criptografia de chaves**: AES-256-GCM (`node:crypto`) via `LLM_ENCRYPTION_SECRET` — a chave do usuário nunca é exposta; a UI mostra apenas máscara.
- **Persistência**: modelos Prisma `LlmSettings` (1:1 User) e `AiQuest` + enum `AiQuestStatus`; migration offline em `prisma/migrations/20260731000000_add_llm_ai_quest`.
- **Server actions** (`src/app/actions/teacher.ts`): `getLlmSettings` (máscara, nunca a chave), `saveLlmSettings` (vazio = mantém), `testLlmConnection`, `generateTeacherQuest`, `evaluateAnswer`, `submitTeacherQuest` (XP por faixa de score + transação). Fallback local por similaridade quando o LLM não está configurado. Rate limit por usuário (20 req/min).
- **UI**: Settings → seção "Professor / IA" (provedor, modelo, chave mascarada, testar conexão, salvar); `TeacherQuestCard` em `/learn` (gerar missão → desafio com dicas progressivas → correção com score/praise/versão nativa/porquê/pista).
- **Feedback nas lições**: `WritingStep` e `SpeakingStep` corrigidos via `evaluateAnswer` com fallback offline.
- **Skill tree 80%+**: `unlockSkillNode` exige pré-requisitos `MASTERED`; `masterSkillNode` exige progresso ≥ 0.8; novo `recordSkillProgress` (média móvel exponencial).

### Variáveis de ambiente
`LLM_ENCRYPTION_SECRET` (obrigatória para criptografar chaves de usuário) + opcionais `NVIDIA_API_KEY`, `OPENROUTER_API_KEY`, `GROQ_API_KEY` (fallback de dev).

### Pendências
- Vincular XP de `AiQuest` ao sync do game-store (hoje incrementa direto no banco, coerente com `claimQuestReward`).
- Marcar `recordSkillProgress` a partir da conclusão de lições (hoje o hook existe, mas não é chamado no fluxo de lição).
- Loot pool sorteado na conclusão da quest (hoje salvo, mas não entregue via inventário).
- "Missão de reforço" para erros recorrentes (3x) e escudo de streak.

---

## Milestones & Deliverables

| Milestone | Target Date | Deliverable |
|-----------|-------------|-------------|
| M0: Foundation | Semana 1 | Repo funcionando, CI/CD, Auth, Dashboard vazio |
| M1: Core Loop | Semana 3 | Onboarding → Lição → Level Up → Dashboard |
| M2: Skill Tree + SRS | Semana 5 | Árvore hexagonal + Review queue offline-first |
| M3: Loot + Inventory | Semana 6.5 | Drops, inventário, equipamento, crafting |
| M4: Quests + Social | Semana 8.5 | Party, Guild, Leaderboards, Friends |
| M5: Content Pipeline | Semana 10.5 | Admin CMS + 50+ lições + recomendações |
| M6: Launch Ready | Semana 12 | Polish, a11y, PWA, load test, analytics |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Next.js 15 RSC learning curve | Média | Atraso 3-5 dias | Pair programming, docs oficiais, exemplos Vercel |
| Skill tree hex render performance mobile | Alta | UX ruim | Virtualização, canvas fallback, simplificar mobile |
| SRS sync conflicts (offline) | Baixa | Data loss | "Server wins" + merge local, testes de caos |
| Content production bottleneck | Alta | Atraso Phase 5 | Authoring tool primeiro, templates, freelance writers |
| Web Speech API browser support | Média | Speaking feature quebrado | Fallback gravar áudio → upload → Whisper API (futuro) |
| Framer Motion bundle size | Baixa | Performance | Tree-shaking, lazy load animações pesadas |
| Prisma connection pool limits | Baixa | Erros 500 | PgBouncer, connection pooling config |

---

## Team Roles (Suggested)

| Role | Responsibilities |
|------|------------------|
| **Tech Lead** | Architecture, code review, CI/CD, Prisma, Auth |
| **Frontend Engineer (2x)** | Components, animations, dashboard, lesson engine |
| **Backend Engineer** | Server Actions, API, DB, SRS sync, quests |
| **Content Designer** | Lição writing, tag taxonomy, balanceamento XP/loot |
| **UI/UX Designer** | Figma specs, mascot animations, accessibility |
| **QA/Playtest Coordinator** | Test plans, playtest sessions, bug triage |

---

## Definition of Done (Per Feature)

- [ ] TypeScript strict: zero errors
- [ ] Unit tests: ≥90% coverage em lib/
- [ ] Component tests: Storybook stories + visual regression
- [ ] E2E test: happy path + 1 edge case
- [ ] Accessibility: axe-core pass + manual keyboard test
- [ ] Performance: Lighthouse >90, bundle size budget
- [ ] Documentation: README + JSDoc em funções públicas
- [ ] Code review: approved by 1+ engineer
- [ ] Deployed to preview: stakeholder sign-off

---

## Post-Launch Roadmap (Ideas)

- **AI-generated lessons**: User provides topic → GPT-4o creates lesson + audio (ElevenLabs)
- **Adaptive difficulty**: ML model ajusta lição baseado em performance histórica
- **Live classes**: Video rooms com professor, XP bonus por participação
- **Certification prep**: TOEFL/IELTS/Cambridge tracks com mock exams
- **Corporate plans**: Team dashboards, admin panel, SSO, custom content
- **Mobile app**: React Native (Expo) shared codebase via Tamagui/NativeWind
- **Marketplace**: Community-created lessons, revenue share