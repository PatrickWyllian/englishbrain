# 🔒 Relatório de Auditoria de Segurança — EnglishQuest

**Data:** 29 de Julho de 2026  
**Auditor:** Security-Auditor (AI)  
**Projeto:** EnglishQuest — Next.js 15 App Router + Prisma + PostgreSQL  
**Classificação Geral:** 🔴 **CRÍTICO**

---

## 📋 Resumo Executivo

A aplicação EnglishQuest possui **vulnerabilidades críticas** que comprometem a autenticação, autorização e integridade dos dados. O problema mais grave é o **bypass completo de autenticação** no provider Credentials, permitindo que qualquer combinação email/senha seja aceita. Além disso, a verificação de role ADMIN no middleware é feita de forma insegura, permitindo forjar tokens JWT.

**Achados por Severidade:**
- 🔴 Críticos: 3
- 🟠 Altos: 6
- 🟡 Médios: 4
- 🟢 Baixos: 3

---

## 🔴 Achados Críticos (Corrigir Imediatamente)

### C1: Bypass Completo de Autenticação no Credentials Provider

**Severidade:** CRÍTICA (CVSS 9.8)  
**Arquivo:** `src/lib/auth/config.ts:60-76`

```typescript
authorize(credentials) {
  if (
    typeof credentials?.email === "string" &&
    credentials.email.length > 0 &&
    typeof credentials?.password === "string" &&
    credentials.password.length > 0
  ) {
    return {
      id: "dev-user-1",  // ← USUÁRIO HARDCODED!
      email: credentials.email,
      name: "Aventureiro",
      image: null,
    };
  }
  return null;
},
```

**Problema:** A função `authorize()` retorna um usuário hardcoded para QUALQUER combinação de email/senha não vazia. Isso significa:
- Qualquer senha é aceita
- O ID do usuário é sempre `dev-user-1`
- Não há verificação real contra o banco de dados

**Impacto:** Qualquer pessoa pode autenticar-se como qualquer usuário. Roubo completo de contas.

**Correção:**
```typescript
async authorize(credentials) {
  const validatedFields = loginSchema.safeParse(credentials);
  if (!validatedFields.success) return null;
  
  const { email, password } = validatedFields.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.hashedPassword) return null;
  
  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) return null;
  
  return { id: user.id, email: user.email, name: user.name, image: user.image };
},
```

---

### C2: Verificação de Role ADMIN Insegura no Middleware

**Severidade:** CRÍTICA (CVSS 9.1)  
**Arquivo:** `src/middleware.ts:23-31`

```typescript
const parts = sessionToken.split(".");
if (parts.length !== 3) { /* redirect */ }
const payload = JSON.parse(atob(parts[1]));  // ← DECODE SEM VERIFICAR ASSINATURA!
const role = payload.role as string | undefined;
if (!role || role !== "ADMIN") { /* redirect */ }
```

**Problema:** O middleware decodifica o JWT usando `atob()` **sem verificar a assinatura**. Um atacante pode:
1. Decodificar um JWT válido
2. Modificar o payload para incluir `role: "ADMIN"`
3. Re-encodificar (sem assinatura válida)
4. Enviar o token forjado

**Impacto:** Acesso não autorizado a rotinas administrativas.

**Correção:** Usar a verificação de JWT do NextAuth em vez de decodificação manual:
```typescript
import { auth } from "@/lib/auth";

// Usar auth() para verificar a sessão server-side
const session = await auth();
if (!session || session.user.role !== "ADMIN") {
  // redirecionar
}
```

---

### C3: Secret JWT de Desenvolvimento em Produção

**Severidade:** CRÍTICA (CVSS 8.5)  
**Arquivo:** `.env:11`

```
AUTH_SECRET="dev-secret-min-32-chars-for-local-only!!"
```

**Problema:** O AUTH_SECRET é um valor previsível de desenvolvimento. Se este valor estiver em produção:
- Tokens JWT podem ser forjados
- Sessões podem ser hijackadas
- Dados sensíveis ficam expostos

**Impacto:** Comprometimento total do sistema de autenticação.

**Correção:** Gerar um secret criptograficamente seguro:
```bash
openssl rand -base64 32
```

---

## 🟠 Achados Altos (Corrigir em Breve)

### H1: Falta de Validação de Entrada nas Server Actions

**Severidade:** ALTA (CVSS 7.5)  
**Arquivos:** `src/app/actions/user.ts` (múltiplas funções)

```typescript
export async function addUserXp(xpAmount: number) {  // ← Sem validação!
  const bigIntXp = BigInt(Math.abs(Math.round(xpAmount)));
  // ...
}

export async function updateUserLevel(level: number) {  // ← Sem validação!
  return prisma.user.update({ where: { id: user.id }, data: { level } });
}

export async function updateUserClass(playerClass: string) {  // ← Cast inseguro!
  return prisma.user.update({
    data: { class: playerClass as "WARRIOR" | "MAGE" | "ROGUE" | "CLERIC" },
  });
}
```

**Problema:** Valores negativos, enormes ou inválidos são aceitos diretamente.

**Correção:** Usar Zod para validar:
```typescript
import { z } from "zod";

const addXpSchema = z.object({
  xpAmount: z.number().int().min(0).max(10000),
});

export async function addUserXp(xpAmount: number) {
  const validated = addXpSchema.parse({ xpAmount });
  // ...
}
```

---

### H2: Vulnerabilidade de Mass Assignment

**Severidade:** ALTA (CVSS 7.2)  
**Arquivo:** `src/app/actions/user.ts:157-173`

```typescript
export async function syncGameStateToDb(state: SyncGameStateInput) {
  const data: Record<string, unknown> = {};
  if (state.level !== undefined) data.level = state.level;
  if (state.xp !== undefined) data.xp = BigInt(state.xp);
  // ... mapeia campos diretamente
  return prisma.user.update({ where: { id: user.id }, data });
}
```

**Problema:** O objeto `SyncGameStateInput` permite definir campos como `level`, `xp`, `mana` sem validação de limites. Um atacante pode:
- Definir level para 999
- Definir mana para 99999
- Manipular streak e longestStreak

**Correção:** Validar cada campo com limites razoáveis:
```typescript
const syncSchema = z.object({
  level: z.number().int().min(1).max(100).optional(),
  xp: z.string().regex(/^\d+$/).optional(),
  mana: z.number().int().min(0).max(1000).optional(),
  // ...
});
```

---

### H3: Rate Limiting Ausente

**Severidade:** ALTA (CVSS 6.5)  
**Arquivos:** Todas as Server Actions

**Problema:** Nenhuma server action possui rate limiting. Isso permite:
- Brute force de senhas
- Ataques de negação de serviço
- Abuso de recursos do servidor

**Correção:** Implementar rate limiting com `@upstash/ratelimit` ou similar.

---

### H4: Database Fallback com Credenciais Hardcoded

**Severidade:** ALTA (CVSS 6.8)  
**Arquivo:** `src/lib/prisma.ts:13-16`

```typescript
if (!connectionString) {
  return new PrismaClient({
    adapter: new PrismaPg(
      new Pool({ connectionString: "postgresql://localhost:5432/englishquest" })
    ),
  });
}
```

**Problema:** Se `DATABASE_URL` não estiver definido, usa credenciais hardcoded. Em produção, isso pode vazar informações.

**Correção:** Lançar erro se `DATABASE_URL` não estiver definido em produção.

---

### H5: OAuth com Account Linking Perigoso

**Severidade:** ALTA (CVSS 6.5)  
**Arquivo:** `src/lib/auth/config.ts:80,85`

```typescript
GitHub({
  allowDangerousEmailAccountLinking: true,  // ← PERIGOSO!
}),
Google({
  allowDangerousEmailAccountLinking: true,  // ← PERIGOSO!
}),
```

**Problema:** Permite vinculação de contas sem verificação, facilitando account takeover.

**Correção:** Remover `allowDangerousEmailAccountLinking` ou configurar verificação de email.

---

### H6: Service Worker Cacheia Dados Sensíveis

**Severidade:** ALTA (CVSS 6.5)  
**Arquivo:** `public/sw.js:32-42`

```javascript
if (url.pathname.startsWith("/api/")) {
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
}
```

**Problema:** Cacheia respostas da API, incluindo dados sensíveis. Persiste mesmo após logout.

**Correção:** Não cachear respostas de API ou usar `Cache-Control: no-store`.

---

## 🟡 Achados Médios (Endereçar)

### M1: Geração de Convite Insegura

**Severidade:** MÉDIA (CVSS 5.5)  
**Arquivo:** `src/app/actions/party.ts:6-13`

```typescript
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];  // ← Math.random() não é criptográfico!
  }
  return code;
}
```

**Problema:** Usa `Math.random()` que não é criptograficamente seguro. Código de 6 caracteres = 2.1B combinações.

**Correção:** Usar `crypto.randomUUID()` ou `crypto.getRandomValues()`.

---

### M2: SQL Raw com Possível Injeção

**Severidade:** MÉDIA (CVSS 5.0)  
**Arquivo:** `src/app/actions/inventory.ts:203-211`

```typescript
await prisma.$executeRaw`
  UPDATE "User" SET "activeEffects" = jsonb_build_array(${JSON.stringify(newEffect)}::jsonb)
  WHERE id = ${userId}
`.catch(async () => {
  await prisma.user.update({ /* fallback */ });
});
```

**Problema:** Usa `$executeRaw` com template literals. Embora Prisma parâetrize, o padrão é arriscado.

**Correção:** Usar Prisma Client API em vez de raw queries.

---

### M3: Ausência de Security Headers

**Severidade:** MÉDIA (CVSS 4.5)  
**Arquivo:** `next.config.ts`

**Problema:** Não há headers de segurança configurados:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Referrer-Policy

**Correção:** Adicionar no `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};
```

---

### M4: Informação de Erro Exposta

**Severidade:** MÉDIA (CVSS 4.0)  
**Arquivo:** `src/app/actions/admin.ts:28-29`

```typescript
if (!admin) {
  return { error: "Não autorizado" };  // ← Confirma que o endpoint existe
}
```

**Problema:** Mensagens de erro diferentes para "não autenticado" vs "não autorizado" revelam informações.

**Correção:** Usar mensagem genérica para ambos os casos.

---

## 🟢 Achados Baixos

### B1: CORS Não Configurado
- Não há configuração CORS explícita
- Next.js aplica políticas padrão

### B2: Dependências Sem Vulnerabilidades
- `npm audit` retornou 0 vulnerabilidades
- Boa prática, mas deve ser verificado regularmente

### B3: Gitignore Protege .env
- `.gitignore` inclui `.env*`
- Boa prática confirmada

---

## 📊 Checklist OWASP Top 10 (2021)

| # | Vulnerabilidade | Status | Notas |
|---|----------------|--------|-------|
| A01 | Broken Access Control | 🔴 FALHA | C1, C2, H2 |
| A02 | Cryptographic Failures | 🔴 FALHA | C3 |
| A03 | Injection | 🟡 PARCIAL | Prisma previne SQL injection, mas H1 permite manipulation |
| A04 | Insecure Design | 🟠 FALHA | H3, H5 |
| A05 | Security Misconfiguration | 🟠 FALHA | M3, H4 |
| A06 | Vulnerable Components | 🟢 OK | npm audit limpo |
| A07 | Auth Failures | 🔴 FALHA | C1, C2, H1 |
| A08 | Data Integrity Failures | 🟡 PARCIAL | H2 |
| A09 | Logging Failures | 🟡 PARCIAL | console.error apenas |
| A10 | SSRF | 🟢 OK | Sem SSRF identificado |

---

## ✅ Recomendações Prioritárias

### Imediato (Esta Sprint)
1. ✅ Implementar autenticação real no Credentials Provider
2. ✅ Corrigir verificação de role ADMIN no middleware
3. ✅ Gerar novo AUTH_SECRET para produção
4. ✅ Adicionar validação Zod em todas as server actions

### Curto Prazo (Próximas 2-3 Sprints)
5. ✅ Implementar rate limiting
6. ✅ Adicionar security headers no next.config.ts
7. ✅ Configurar CORS adequadamente
8. ✅ Corrigir service worker para não cachear dados sensíveis

### Médio Prazo
9. ✅ Implementar logging de segurança
10. ✅ Adicionar monitoramento de tentativas de login
11. ✅ Revisar e atualizar dependências regularmente

---

## 📁 Arquivos Afetados

| Arquivo | Achados |
|---------|---------|
| `src/lib/auth/config.ts` | C1, H5 |
| `src/middleware.ts` | C2 |
| `.env` | C3 |
| `src/app/actions/user.ts` | H1, H2 |
| `src/app/actions/*.ts` | H3 (todas) |
| `src/lib/prisma.ts` | H4 |
| `public/sw.js` | H6 |
| `src/app/actions/party.ts` | M1 |
| `src/app/actions/inventory.ts` | M2 |
| `next.config.ts` | M3 |

---

*Relatório gerado automaticamente. Recomenda-se revisão manual por um profissional de segurança.*
