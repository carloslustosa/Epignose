// Modulo exclusivo de servidor.
import { env } from '../env'

// ---------------------------------------------------------------------------
// CAMADA DE BUSCA NA WEB
//
// Provedor padrao: TAVILY (feito para agentes de IA — devolve o conteudo da
// pagina ja extraido, o que economiza uma rodada de scraping).
//
// >>> CONFIGURACAO <<<
//   Tavily:  https://app.tavily.com  ->  .env:  TAVILY_API_KEY="tvly-..."
//   Google:  https://programmablesearchengine.google.com  ->  .env:
//              GOOGLE_SEARCH_API_KEY="AIza..."
//              GOOGLE_SEARCH_ENGINE_ID="a1b2c3..."
//
// Se as duas chaves existirem, Tavily tem prioridade. Sem nenhuma, a busca
// lanca erro e a UI cai no modo demonstracao.
// ---------------------------------------------------------------------------

export interface WebSearchHit {
  title: string
  url: string
  /** Trecho/conteudo bruto da pagina — e o que o LLM le para resumir. */
  content: string
  publishedDate?: string | null
  score?: number
}

export interface WebSearchOptions {
  /** Resultados por consulta. */
  maxResults?: number
  /** Restringe a dominios (ex.: ['stj.jus.br', 'scielo.br']). */
  includeDomains?: string[]
  excludeDomains?: string[]
  /** 'advanced' varre mais fundo e devolve mais texto por pagina. */
  depth?: 'basic' | 'advanced'
}

/** Consulta a Tavily Search API. */
async function searchTavily(query: string, opts: WebSearchOptions): Promise<WebSearchHit[]> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      search_depth: opts.depth ?? 'advanced',
      max_results: opts.maxResults ?? 6,
      include_answer: false,
      include_raw_content: true,
      include_domains: opts.includeDomains,
      exclude_domains: opts.excludeDomains,
    }),
    // Busca academica e lenta; damos folga.
    signal: AbortSignal.timeout(30_000),
  })

  if (!res.ok) {
    throw new Error(`Tavily respondeu ${res.status}: ${await res.text()}`)
  }

  const data = (await res.json()) as {
    results?: Array<{
      title: string
      url: string
      content: string
      raw_content?: string
      published_date?: string
      score?: number
    }>
  }

  return (data.results ?? []).map((r) => ({
    title: r.title,
    url: r.url,
    // Limitamos o texto cru: paginas inteiras estouram a janela de contexto.
    content: (r.raw_content ?? r.content ?? '').slice(0, 6000),
    publishedDate: r.published_date ?? null,
    score: r.score,
  }))
}

/** Fallback: Google Programmable Search (só devolve snippet, sem corpo). */
async function searchGoogle(query: string, opts: WebSearchOptions): Promise<WebSearchHit[]> {
  const url = new URL('https://www.googleapis.com/customsearch/v1')
  url.searchParams.set('key', env.GOOGLE_SEARCH_API_KEY!)
  url.searchParams.set('cx', env.GOOGLE_SEARCH_ENGINE_ID!)
  url.searchParams.set('q', query)
  url.searchParams.set('num', String(Math.min(opts.maxResults ?? 6, 10)))

  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) })
  if (!res.ok) throw new Error(`Google Search respondeu ${res.status}`)

  const data = (await res.json()) as {
    items?: Array<{ title: string; link: string; snippet: string }>
  }

  return (data.items ?? []).map((i) => ({
    title: i.title,
    url: i.link,
    content: i.snippet ?? '',
  }))
}

/** Escolhe o provedor disponivel. */
export async function webSearch(
  query: string,
  opts: WebSearchOptions = {}
): Promise<WebSearchHit[]> {
  if (env.TAVILY_API_KEY) return searchTavily(query, opts)
  if (env.GOOGLE_SEARCH_API_KEY && env.GOOGLE_SEARCH_ENGINE_ID) return searchGoogle(query, opts)
  throw new Error(
    'Nenhuma API de busca configurada. Defina TAVILY_API_KEY (ou GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_ENGINE_ID) no .env'
  )
}

/** Nome do provedor ativo — gravado em ReferenceSearch.searchProvider. */
export function activeSearchProvider(): string | null {
  if (env.TAVILY_API_KEY) return 'tavily'
  if (env.GOOGLE_SEARCH_API_KEY) return 'google-cse'
  return null
}

/**
 * Dispara varias consultas em paralelo e remove URLs repetidas.
 * O agente usa isso para cobrir jurisprudencia, doutrina e noticias de uma vez.
 */
export async function multiSearch(
  queries: string[],
  opts: WebSearchOptions = {}
): Promise<WebSearchHit[]> {
  const batches = await Promise.allSettled(queries.map((q) => webSearch(q, opts)))

  const seen = new Set<string>()
  const merged: WebSearchHit[] = []

  for (const batch of batches) {
    if (batch.status !== 'fulfilled') {
      console.error('[web-search] consulta falhou:', batch.reason)
      continue
    }
    for (const hit of batch.value) {
      const key = hit.url.replace(/[#?].*$/, '')
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(hit)
    }
  }

  // Se todas as consultas falharem, o erro precisa subir para a UI.
  if (merged.length === 0 && batches.every((b) => b.status === 'rejected')) {
    throw new Error(
      batches[0] && 'reason' in batches[0]
        ? String((batches[0] as PromiseRejectedResult).reason)
        : 'Busca na web falhou'
    )
  }

  return merged
}
