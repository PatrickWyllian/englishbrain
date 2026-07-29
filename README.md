This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Configuração do Ambiente

### Rápido (recomendado)

```bash
./scripts/setup-env.sh
```

Isso cria `.env.local` com valores padrão e gera um `AUTH_SECRET` seguro.

### Manual

1. Copie o template:

```bash
cp .env.example .env.local
```

2. Gere um secret seguro:

```bash
openssl rand -base64 32
```

3. Cole o valor gerado em `AUTH_SECRET` dentro de `.env.local`.

4. Preencha as demais variáveis conforme necessário.

### Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | String de conexão PostgreSQL |
| `AUTH_SECRET` | Sim | Secret do NextAuth (min 32 chars) |
| `AUTH_URL` | Sim | URL base do app |
| `AUTH_GITHUB_ID` | Não | Client ID do GitHub OAuth |
| `AUTH_GITHUB_SECRET` | Não | Client Secret do GitHub OAuth |
| `AUTH_GOOGLE_ID` | Não | Client ID do Google OAuth |
| `AUTH_GOOGLE_SECRET` | Não | Client Secret do Google OAuth |
| `NEXT_PUBLIC_POSTHOG_KEY` | Não | Chave do PostHog |
| `SENTRY_DSN` | Não | DSN do Sentry |

### Como obter credenciais

#### GitHub OAuth

1. Acesse https://github.com/settings/developers
2. Clique em "New OAuth App"
3. Preencha:
   - **Application name**: EnglishQuest
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github
4. Copie o **Client ID** e gere um **Client Secret**

#### Google OAuth

1. Acesse https://console.cloud.google.com/apis/credentials
2. Crie um novo projeto ou selecione um existente
3. Clique em "Create Credentials" > "OAuth client ID"
4. Configure a tela de consentimento
5. Preencha:
   - **Application type**: Web application
   - **Authorized redirect URIs**: http://localhost:3000/api/auth/callback/google
6. Copie o **Client ID** e **Client Secret**

#### PostHog

1. Acesse https://posthog.com e crie uma conta
2. Crie um novo projeto
3. Vá em Project Settings > API Keys
4. Copie a **Project API Key**

#### Sentry

1. Acesse https://sentry.io e crie uma conta
2. Crie um novo projeto (Next.js)
3. Siga as instruções de instalação
4. Copie o **DSN** exibido no dashboard

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
