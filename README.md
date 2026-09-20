# Epignose

Rede social acadêmica para pesquisadores — um repositório interativo de publicações que
mistura a dinâmica de feed do X/Instagram com o rigor de um ambiente de revisão por pares
aberta.

## O que já está implementado

| Funcionalidade | Estado |
| --- | --- |
| Layout de 3 colunas (nav · feed · trending), responsivo, dark mode nativo | pronto |
| Card de artigo com título, autor, abstract, tags e ações (curtir, criticar, baixar) | pronto |
| Página padronizada de leitura do artigo (`ArticleView`) | pronto |
| Peer review: comentários em thread, tipados, com citação de trecho | pronto |
| Avaliação por estrelas com critérios acadêmicos (rigor, originalidade, clareza) | pronto |
| Upload de PDF/DOCX com extração automática de título, resumo e metadados | pronto |
| Anti-plágio: SHA-256 do arquivo, hash do conteúdo e similaridade por shingles | pronto |
| Buscador de Referências IA (planejar → buscar na web → analisar adequação) | pronto |
| Schema Prisma completo (User, Post, Comment, Rating, Like, ReferenceSearch…) | pronto |
| Perfil do pesquisador, biblioteca, notificações, páginas institucionais | pronto |
| Autenticação real | **ponto de extensão** — ver `src/lib/auth.ts` |

Sem nenhuma chave de API configurada, a aplicação sobe em **modo demonstração**: todas as
telas navegam com dados de exemplo e um aviso indica o que falta no `.env`.

## Protótipo estático (sem build)

`prototype/index.html` é um arquivo único que abre direto no navegador, sem Node e sem
instalar nada. Ele espelha as três telas centrais do produto — feed, leitura com revisão por
pares e o Buscador de Referências IA (com o pipeline do agente animado) — e serve para
mostrar a interface a orientadores, bancas e investidores antes de provisionar servidor.

```bash
# macOS
open prototype/index.html
# Linux
xdg-open prototype/index.html
```

A aplicação real está em `src/`; o protótipo não compartilha código com ela.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions) + **React 19** + TypeScript
- **Tailwind CSS 3.4** + componentes no padrão **shadcn/ui** (escritos no repositório, sem CLI)
- **Lucide Icons**
- **Prisma 6** + **PostgreSQL**
- **Supabase Storage** (ou AWS S3) para os PDFs/DOCXs
- **OpenAI** (GPT-4o) + **Tavily** (ou Google Custom Search) para o agente de referências
- `pdf-parse` e `mammoth` para extração de texto e metadados

## Como rodar localmente

```bash
# 1. dependências
npm install

# 2. variáveis de ambiente
cp .env.example .env      # edite e preencha (veja a seção "Chaves de API")

# 3. banco de dados (só se você preencheu DATABASE_URL)
npm run db:push           # cria as tabelas
npm run db:seed           # popula com dados de exemplo

# 4. desenvolvimento
npm run dev               # http://localhost:3000
```

Sem o passo 3 a aplicação roda igual, servindo os dados de `src/lib/mock-data.ts`.

## Chaves de API — onde colocar cada uma

Todas vão no arquivo `.env` na raiz (copiado de `.env.example`). Nenhuma delas é lida pelo
browser, exceto as prefixadas com `NEXT_PUBLIC_`.

| Variável | Para quê | Onde obter |
| --- | --- | --- |
| `DATABASE_URL` | Persistir usuários, artigos, comentários | Hostinger VPS, [Supabase](https://supabase.com), [Neon](https://neon.tech) |
| `OPENAI_API_KEY` | Resumos e análise de adequação das referências | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `OPENAI_MODEL` | `gpt-4o` (qualidade) ou `gpt-4o-mini` (custo) | — |
| `TAVILY_API_KEY` | Busca na web em tempo real | [app.tavily.com](https://app.tavily.com) |
| `GOOGLE_SEARCH_API_KEY` + `GOOGLE_SEARCH_ENGINE_ID` | Alternativa à Tavily | [programmablesearchengine.google.com](https://programmablesearchengine.google.com) |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` | Storage (cliente) | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Upload dos arquivos (**só servidor**) | Supabase → Settings → API |
| `AUTH_SECRET` | Assinatura de sessão | `openssl rand -base64 32` |

A validação dessas variáveis está em **`src/lib/env.ts`**, que também expõe as flags
`features.{database,openai,webSearch,storage}` usadas para decidir entre dados reais e
modo demonstração.

> **Nunca** prefixe `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` ou `TAVILY_API_KEY` com
> `NEXT_PUBLIC_`. Isso as embutiria no bundle do navegador e as exporia publicamente.

## Deploy na Hostinger (VPS com Node.js)

O `next.config.mjs` usa `output: 'standalone'`, que gera um servidor auto-contido em
`.next/standalone/server.js` — o formato ideal para PM2 numa VPS.

```bash
# --- na VPS, via SSH ---
git clone <seu-repositorio> /var/www/epignose
cd /var/www/epignose

npm ci                      # instala dependências (roda prisma generate)
cp .env.example .env        # preencha as chaves de produção
nano .env

npx prisma migrate deploy   # aplica as migrations no banco de produção
npm run build               # build + copia public/ e .next/static para o standalone

# --- PM2 ---
npm install -g pm2
pm2 start npm --name epignose -- start
pm2 save
pm2 startup                 # sobe sozinho no reboot
```

`npm start` executa `node .next/standalone/server.js`. O script `bundle:standalone` (chamado
automaticamente pelo `build`) copia `public/` e `.next/static` para dentro do bundle — sem
esse passo o standalone sobe sem CSS e sem imagens.

### Variáveis de ambiente no hPanel

Se preferir gerenciá-las pelo painel em vez do `.env`:
**hPanel → seu site/VPS → Node.js → Environment Variables**. Se usar PM2, você também pode
declará-las num `ecosystem.config.js`:

```js
module.exports = {
  apps: [{
    name: 'epignose',
    script: '.next/standalone/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://...',
      OPENAI_API_KEY: 'sk-proj-...',
      // …demais chaves
    },
  }],
}
```

### Nginx como proxy reverso

```nginx
server {
    listen 80;
    server_name seudominio.com.br;

    client_max_body_size 30M;   # necessário: upload de artigos até 25 MB

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Depois rode `certbot --nginx -d seudominio.com.br` para o HTTPS.

## Estrutura do projeto

```
prisma/
  schema.prisma              Schema completo (User, Post, Comment, Rating, ReferenceSearch…)
  seed.ts                    Dados de exemplo para o banco

src/
  app/
    layout.tsx               Root layout (fonte Inter, ThemeProvider)
    page.tsx                 Feed principal
    artigo/[id]/page.tsx     Leitura do artigo + peer review
    buscador-ia/page.tsx     Buscador de Referências IA
    publicar/page.tsx        Upload de artigo
    explorar/ perfil/ biblioteca/ notificacoes/
    actions/
      posts.ts               Upload → extração → anti-plágio → storage → banco
      comments.ts            Comentários em thread e avaliações
      references.ts          Server Action do agente de IA

  components/
    layout/                  AppShell (3 colunas), sidebars, header
    feed/                    ArticleCard, ComposeBox, UploadForm
    article/                 ArticleView (leitura), PeerReview (threads + estrelas)
    ai/                      ReferenceSearch, ReferenceCard (Resumo + Adequação)
    ui/                      Primitivos shadcn/ui

  lib/
    env.ts                   Validação das variáveis de ambiente (Zod)
    prisma.ts                Singleton do Prisma Client
    queries.ts               Leitura (banco real ou mock)
    auth.ts                  Sessão — PONTO DE EXTENSÃO para NextAuth/Supabase/ORCID
    extract.ts               Extração de texto e metadados de PDF/DOCX
    hash.ts                  SHA-256, shingles e similaridade de Jaccard
    plagiarism.ts            Verificação anti-plágio no upload
    storage.ts               Supabase Storage (com receita para migrar para S3)
    ai/
      openai.ts              Cliente OpenAI
      web-search.ts          Tavily / Google Custom Search
      reference-agent.ts     Pipeline do agente (planejar → buscar → analisar)
```

## Como o Buscador de Referências funciona

`src/lib/ai/reference-agent.ts` roda três etapas:

1. **Planejar** — o LLM lê o tema e o reescreve em 4 a 6 consultas de busca especializadas,
   com a terminologia técnica da área (siglas de tribunais para jurisprudência, termos em
   inglês para produção científica).
2. **Buscar** — as consultas vão em paralelo para a Tavily (ou Google CSE); os resultados são
   deduplicados por URL.
3. **Analisar** — o LLM lê cada página e produz, para cada referência: tipo, resumo,
   **adequação** (parágrafo explicando como aquela fonte se encaixa no recorte exato do
   usuário e em que seção do trabalho ela cabe), nota de aderência 0-100 e citação ABNT.

O prompt do analista proíbe explicitamente adequações genéricas — o texto precisa citar o
tema do usuário de forma concreta.

## Como o anti-plágio funciona

No upload, `src/lib/plagiarism.ts` executa três checagens, da mais barata para a mais cara:

1. **`fileHash`** — SHA-256 do binário, com índice `UNIQUE` no banco. Pega reupload do arquivo
   idêntico e o Postgres rejeita até em condição de corrida entre duas contas.
2. **`contentHash`** — SHA-256 do texto normalizado (sem acento, pontuação nem variação de
   espaço). Pega o mesmo conteúdo reexportado, convertido de PDF para DOCX ou com metadados
   trocados.
3. **Shingles + Jaccard** — similaridade parcial contra os artigos da mesma área. Acima de
   85% bloqueia; entre 35% e 85% publica com sinalização visível no card.

Além disso, o autor declarado nos metadados do arquivo é comparado com quem está publicando;
divergência gera alerta (não bloqueia).

Para verificação forte contra a web aberta, plugue um provedor (Copyleaks, Turnitin,
PlagScan) no lugar da etapa 3 — o ponto de extensão está comentado no arquivo.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção + bundle standalone |
| `npm start` | Roda o bundle standalone (produção) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:push` | Cria/atualiza as tabelas sem migration |
| `npm run db:migrate` | Cria uma migration versionada |
| `npm run db:seed` | Popula o banco com dados de exemplo |
| `npm run db:studio` | Prisma Studio (GUI do banco) |

## Próximos passos sugeridos

1. **Autenticação** — plugar NextAuth/Auth.js ou ORCID OAuth em `src/lib/auth.ts`.
2. **Notificações reais** — criar o model `Notification` e gravar nas Server Actions.
3. **Busca full-text** — `pg_trgm` ou `tsvector` no Postgres para buscar dentro dos artigos.
4. **Fila para o anti-plágio** — mover a etapa de shingles para BullMQ/Inngest quando o acervo
   crescer.
5. **Visualizador de PDF inline** — `react-pdf` na página de leitura, com âncora de comentário
   por página.
