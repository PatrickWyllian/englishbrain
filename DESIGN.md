# DESIGN.md — EnglishQuest

<!--
This is the fillable template. When producing a DESIGN.md as part of a blueprint,
copy this structure, replace every [placeholder], remove these HTML comments, and
delete any sub-bullets that don't apply. Do not add sections beyond these nine.

See references/nine-section-protocol.md for how to write each section well.
-->

## 1. Objective

Criar um **sistema de aprendizado de inglês contextualizado + RPG de progressão** onde o usuário *sente* que está evoluindo (XP visível, níveis, equipamentos, skill tree) enquanto aprende com conteúdo que **realmente gosta** (séries, temas profissionais, hobbies). O dashboard deve gerar dopamina a cada sessão: streaks, level-ups, drops de loot, marcos visuais. Qualidade bar: *Duolingo-level retention + Brilliant-level didática + RPG-level progressão*.

## 2. Product Context

- **What the product does:** Ensina inglês (A1–C2) via lições contextualizadas nos interesses do usuário + RPG de progressão (XP, níveis, skill tree, equipamentos, streaks, leaderboards).
- **Who it's for:** Adultos 18–40, autodidatas, gamers/geeks/profissionais de tech, frustrados com apps genéricos. Nível adaptativo via placement test + diagnóstico contínuo.
- **Adjacent brands (feel like these):** Duolingo (retenção), Brilliant (didática visual), Notion (dashboard limpo), Hades/Elden Ring (progressão visceral), Anki (SRS).
- **Distant brand (do not feel like this):** Babbel / cursos tradicionais — aulas genéricas, sem identidade, sem dopamina, "dever de casa".
- **Cultural register:** Playful but competent — divertido sem ser infantil, sério sem ser acadêmico. Tom de "coach que joga RPG com você".

## 3. Visual Foundations

### 3a. Color

- **Neutral scale:** `--n-50: #FAFAF9, --n-100: #F5F5F4, --n-200: #E7E5E4, --n-300: #D6D3D1, --n-400: #A8A29E, --n-500: #78716C, --n-600: #57534E, --n-700: #44403C, --n-800: #292524, --n-900: #1C1917, --n-950: #0C0A09`
- **Accent(s):** `--accent-primary: #F59E0B` (amber-500), `--accent-primary-600: #D97706`, `--accent-secondary: #06B6D4` (cyan-500), `--accent-accent: #A855F7` (purple-500 — rare drops, legendaries)
- **Semantic:** `--success: #22C55E, --warning: #F59E0B, --error: #EF4444, --info: #3B82F6`
- **Usage rules:** Accent-primary 1x per tela no CTA principal ou número de XP principal; accent-secondary para mana, listening, reading stats; accent-accent APENAS para legendary drops, level-up flash, streak 100+; nunca usar accent como background de seção inteira — só highlights; dark mode default (gamers preferem), light mode toggle.

### 3b. Typography

- **Display face:** Space Grotesk, weights 700/600, tracking -0.02em (tight)
- **Body face:** Inter, weights 400/500
- **Mono face:** JetBrains Mono (números, XP, timestamps, code)
- **Fallback stack:** system-ui, sans-serif
- **Type scale (rem):** `0.75 / 0.875 / 1 / 1.125 / 1.5 / 2 / 3 / 4.5 / 6`
- **Weight discipline:** Display só 700/600. UI headings 600/500. Body 400/500. Mono só para números de XP, timestamps, código.

### 3c. Spacing & rhythm

- **Base unit:** 4px
- **Spacing scale:** `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`
- **What "generous" whitespace means in numbers:** section padding ≥ 64px desktop, 32px mobile; card gap 16px; inner card padding 24px.

### 3d. Component seeds

- **Button:** Primary (accent), Secondary (outline n-300), Ghost, Danger. Radius 8px; primary só 1/tela; ícone à esquerda se houver.
- **Card / container:** Default (n-800/900 bg, border n-700), Elevated (shadow-xl), Interactive (hover border-accent). Radius 12px; sem sombra default.
- **XP Bar:** Horizontal (dashboard), Circular (level badge), Mini (lesson end). Gradient accent-primary → accent-secondary; anima 600ms ease-out.
- **Skill Node:** Locked, Available, Active, Mastered. Hexágono 48px; cor = skill color; glow se available.
- **Loot Card:** Common, Rare, Epic, Legendary. Border gradient por raridade; hover flip 3D.
- **Avatar/Frame:** Base, Bronze, Silver, Gold, Diamond, Legendary. Frame animado só Gold+.
- **Iconography:** Lucide (UI) + Custom illustrated set (skills, loot, mascote). Stroke 2px; filled só para states ativos.
- **Mascote:** "Quest" — coruja cyberpunk (olho = camera, asa = teclado). 3 poses: idle, celebrate, think; SVG animated.

## 4. Accessibility

- **Text contrast:** body 4.5:1 min, large text/UI 3:1 min
- **Motion:** `prefers-reduced-motion` desliga XP bar animate, loot flip, confetti. Level-up flash mantém (acessível via aria-live).
- **Focus indicators:** Outline 2px solid accent-primary, offset 2px.
- **Alt text policy:** Decorativo = `""`; Informativo = descrição funcional ("XP bar: 2.340 / 3.000 — 78% para nível 12").
- **Additional a11y floor items:** Live region para XP gain, level up, streak milestone.

## 5. Voice & Tone

- **Register:** Conversacional, direto, *gamer-lingo* leve (XP, grind, drop, build, nerf, buff).
- **Sentence rhythm:** Frases curtas. Imperativo ativo. "Ganhou 240 XP." não "Você ganhou 240 pontos de experiência."
- **Words this brand uses:** XP, Level up, Build, Skill tree, Drop, Streak, Boss fight, Daily quest, Loot.
- **Words this brand refuses:** "seamlessly", "elevate", "journey", "unlock your potential", "delight", "gamificação" (o usuário não precisa saber o termo).
- **Address:** "Você" (singular, direto). Em notificações: "Seu build", "Sua streak".

## 6. Implementation Practices

- **Token format:** CSS Variables (`:root`) + Tailwind `theme.extend` sync via script
- **Component library convention:** shadcn/ui (Radix) + componentes custom (XPBar, SkillNode, LootCard, Mascot)
- **Image treatment rules:** Photography style / illustration system / "no images" as a real choice
- **Grid system:** 12-col desktop, 4-col mobile, container max-w-7xl
- **Motion rules:** Framer Motion — duration 150–600ms, easing `cubic-bezier(0.16, 1, 0.3, 1)`
- **State:** Zustand (global: user, xp, streak, skillTree) + TanStack Query (server) + React Hook Form + Zod
- **i18n:** next-intl (pt-BR default, en-US ready)
- **Charts:** Recharts (dashboard) + custom SVG para skill tree radial
- **Auth:** NextAuth v5 (Credentials + Google + GitHub)
- **DB:** PostgreSQL (Supabase/Neon) + Prisma ORM
- **SRS Engine:** SM-2 adaptado (TS worker) — roda client-side + sync server

## 7. Anti-Patterns

- **No generic "lesson 1, lesson 2" labels.** Sempre: "Ep. 1: Michael's Meeting", "Quest: Email de follow-up".
- **No card grids 3×2 com ícone genérico.** Skill tree hexagonal; loot cards; quest log list.
- **No "Parabéns!" genérico em modais.** "Level 12 — *Assistant Manager* unlocked. +5% Business English drop rate."
- **No progress bars estáticos.** XP bar *sempre* animado; level-up = flash + confetti + loot drop.
- **No empty states "Nada aqui".** "Sua primeira quest aparece depois do placement test. Bora?"
- **No notification bell genérico.** "Quest Log" com badge animado; loot drops aparecem no canto inferior direito (toast style).
- **No footer com 20 links.** 3: Jogar, Build, Config.

## 8. Decision-Making

1. **Didática contextual > Gamificação.** Se a lição não ensina no contexto do interesse do usuário, a gamificação vira "chocolate-covered broccoli".
2. **Progressão visceral > Completude de features.** Um level-up que *pula na tela* vale mais que 5 features sem feedback.
3. **Clareza de estado > Densidade.** O usuário deve saber *exato* onde está na skill tree em 2s.
4. **Performance percebida > Performance real.** Skeleton + optimistic UI + animações mascaram latency.
5. **Acessibilidade não é opcional.** Focus, contraste, reduced-motion — ship blocker se faltar.

## 9. Workflow

1. Definir *learning objective* + *contexto de interesse* do usuário.
2. Escrever roteiro da lição (dialogue, vocab, grammar point) no tom de voz.
3. Mapear para *skill tree nodes* (quais nós recebem XP).
4. Desenhar loot table da lição (common/rare/epic drops).
5. Implementar componente de lição (reutilizar `LessonShell` + slots).
6. Testar SRS scheduling + XP curve no playtest interno.
7. Ship behind feature flag → A/B streak retention → rollout.