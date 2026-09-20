import { z } from 'zod'

// ---------------------------------------------------------------------------
// Validacao das variaveis de ambiente.
//
// >>> ONDE COLOCAR AS CHAVES <<<
// Local:      crie um arquivo `.env` na raiz (copie de `.env.example`).
// Hostinger:  hPanel > seu site/VPS > Node.js > Environment Variables,
//             ou, se voce usa PM2 na VPS, um `ecosystem.config.js` com `env: {...}`.
//             NUNCA versione o `.env` (ja esta no .gitignore).
//
// As chaves de IA/Storage sao OPCIONAIS no boot: a aplicacao sobe sem elas e
// roda em "modo demonstracao" (dados mock). Cada modulo avisa em runtime
// quando a chave que ele precisa esta faltando.
// ---------------------------------------------------------------------------

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // ---- Banco de dados (PostgreSQL) ----
  DATABASE_URL: z.string().url().optional(),

  // ---- OpenAI: resumos e analise de adequacao das referencias ----
  // https://platform.openai.com/api-keys
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o'),

  // ---- Web Search: Tavily (recomendado) ou Google Custom Search ----
  // https://tavily.com  -> chave "tvly-..."
  TAVILY_API_KEY: z.string().optional(),
  // Alternativa: https://programmablesearchengine.google.com
  GOOGLE_SEARCH_API_KEY: z.string().optional(),
  GOOGLE_SEARCH_ENGINE_ID: z.string().optional(),

  // ---- Storage dos PDFs/DOCXs: Supabase Storage (padrao) ou AWS S3 ----
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  // Chave de servico: SO no servidor, nunca prefixada com NEXT_PUBLIC_.
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default('artigos'),

  // Alternativa S3
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  // ---- App ----
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  // Segredo de sessao: gere com `openssl rand -base64 32`
  AUTH_SECRET: z.string().optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success && process.env.NODE_ENV === 'production') {
  console.error('[env] Variaveis de ambiente invalidas:', parsed.error.flatten().fieldErrors)
}

export const env = parsed.success ? parsed.data : schema.parse({})

/** Flags para a UI mostrar o aviso de "modo demonstracao". */
export const features = {
  database: Boolean(env.DATABASE_URL),
  openai: Boolean(env.OPENAI_API_KEY),
  webSearch: Boolean(env.TAVILY_API_KEY || env.GOOGLE_SEARCH_API_KEY),
  storage: Boolean(env.SUPABASE_SERVICE_ROLE_KEY || env.AWS_SECRET_ACCESS_KEY),
}
