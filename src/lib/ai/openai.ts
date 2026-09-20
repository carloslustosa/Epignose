// Modulo exclusivo de servidor.
import OpenAI from 'openai'
import { env } from '../env'

// ---------------------------------------------------------------------------
// CLIENTE OPENAI
//
// >>> CONFIGURACAO <<<
//   1. https://platform.openai.com/api-keys  -> "Create new secret key"
//   2. .env:
//        OPENAI_API_KEY="sk-proj-..."
//        OPENAI_MODEL="gpt-4o"     # ou gpt-4o-mini para baratear
//   3. Na Hostinger: hPanel > Node.js > Environment Variables (ou o
//      ecosystem.config.js do PM2). A chave fica só no servidor.
//
// Custo: cada busca do agente faz 2 chamadas (planejamento + analise).
// Com gpt-4o-mini o custo por busca fica na casa de centavos.
// ---------------------------------------------------------------------------

let client: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY não configurada. Adicione a chave no arquivo .env')
  }
  if (!client) {
    client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      maxRetries: 2,
      timeout: 90_000,
    })
  }
  return client
}

export const MODEL = env.OPENAI_MODEL
