// Modulo exclusivo de servidor.
import { getOpenAI, MODEL } from './openai'
import { multiSearch, activeSearchProvider, type WebSearchHit } from './web-search'
import type { ReferenceKind } from '@/types'

// ---------------------------------------------------------------------------
// AGENTE "BUSCADOR DE REFERENCIAS"  —  o coracao do produto.
//
// Pipeline em tres etapas:
//
//   1. PLANEJAR  — o LLM le o tema do pesquisador e reescreve em 4-6 consultas
//                  de busca especializadas (jurisprudencia, doutrina, artigos,
//                  noticias), com a terminologia tecnica correta.
//   2. BUSCAR    — as consultas vao em paralelo para a API de busca web
//                  (Tavily/Google) e os resultados sao deduplicados.
//   3. ANALISAR  — o LLM le cada pagina encontrada e produz, para cada uma:
//                    - resumo da referencia
//                    - ADEQUACAO: paragrafo dizendo como aquela referencia se
//                      encaixa no tema EXATO do usuario (o diferencial)
//                    - nota de aderencia 0-100 e citacao ABNT pronta
//
// Chaves necessarias: OPENAI_API_KEY + TAVILY_API_KEY (ver src/lib/env.ts).
// ---------------------------------------------------------------------------

export interface AgentReference {
  kind: ReferenceKind
  title: string
  url: string
  source: string | null
  publishedAt: string | null
  authors: string[]
  summary: string
  relevance: string
  relevanceScore: number
  citationAbnt: string | null
}

export interface AgentResult {
  summary: string
  expandedQueries: string[]
  references: AgentReference[]
  model: string
  searchProvider: string | null
  tokensUsed: number
  durationMs: number
}

export interface AgentOptions {
  /** Tipos de referencia desejados; vazio = todos. */
  kinds?: ReferenceKind[]
  /** Recorte temporal em anos (ex.: 5 = só material dos ultimos 5 anos). */
  sinceYears?: number
  /** Quantas referencias devolver, no maximo. */
  limit?: number
}

const KIND_LABEL: Record<ReferenceKind, string> = {
  JURISPRUDENCE: 'jurisprudência (decisões de tribunais, acórdãos, súmulas)',
  DOCTRINE: 'doutrina (obras e autores de referência da área)',
  ARTICLE: 'artigos científicos revisados por pares',
  BOOK: 'livros e capítulos de livro',
  NEWS: 'notícias e reportagens',
  LEGISLATION: 'legislação, normas e regulamentos',
  OTHER: 'outras fontes relevantes',
}

// -------------------------- ETAPA 1: PLANEJAMENTO --------------------------

const PLANNER_PROMPT = `Você é um bibliotecário de pesquisa acadêmica brasileiro.
Dado um TEMA DE PESQUISA, gere consultas de busca na web que encontrem as melhores fontes.

Regras:
- Gere de 4 a 6 consultas, cada uma cobrindo um ângulo diferente do tema.
- Use a terminologia técnica da área (jurídica, médica, exata — conforme o tema).
- Inclua consultas específicas para os tipos de fonte pedidos.
- Para jurisprudência brasileira, inclua siglas de tribunais (STF, STJ, TST, TRF).
- Para produção científica, inclua termos em inglês quando ajudar.
- Consultas curtas e objetivas, sem operadores exóticos.

Responda APENAS com JSON: {"queries": ["...", "..."], "reading": "uma frase sobre o recorte do tema"}`

async function planQueries(
  topic: string,
  opts: AgentOptions
): Promise<{ queries: string[]; reading: string; tokens: number }> {
  const openai = getOpenAI()
  const kinds = opts.kinds?.length ? opts.kinds : (Object.keys(KIND_LABEL) as ReferenceKind[])

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: PLANNER_PROMPT },
      {
        role: 'user',
        content: [
          `TEMA DE PESQUISA: ${topic}`,
          `TIPOS DE FONTE DESEJADOS: ${kinds.map((k) => KIND_LABEL[k]).join('; ')}`,
          opts.sinceYears ? `RECORTE TEMPORAL: últimos ${opts.sinceYears} anos.` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw) as { queries?: string[]; reading?: string }

  return {
    queries: (parsed.queries ?? [topic]).slice(0, 6),
    reading: parsed.reading ?? '',
    tokens: completion.usage?.total_tokens ?? 0,
  }
}

// ---------------------------- ETAPA 3: ANALISE -----------------------------

const ANALYST_PROMPT = `Você é um orientador acadêmico sênior avaliando fontes para um pesquisador.

Para CADA fonte recebida, produza:
- "kind": um de JURISPRUDENCE, DOCTRINE, ARTICLE, BOOK, NEWS, LEGISLATION, OTHER.
- "title": título limpo da fonte (sem nome do site colado).
- "source": veículo/tribunal/revista de origem, ou null.
- "authors": autores identificados, ou [].
- "publishedAt": data em ISO (AAAA-MM-DD), ou null se não houver.
- "summary": 2 a 4 frases sobre O QUE a fonte diz. Objetivo, sem adjetivos vazios.
- "relevance": ADEQUAÇÃO — um parágrafo (3 a 5 frases) explicando como ESTA fonte
  se encaixa especificamente NO TEMA DO USUÁRIO: qual lacuna ela preenche, em que
  seção do trabalho ela cabe (referencial teórico, metodologia, discussão),
  com que ponto do tema ela dialoga ou conflita. Cite o tema do usuário de forma
  concreta — nunca escreva algo que serviria para qualquer pesquisa.
- "relevanceScore": 0 a 100 de aderência real ao tema. Seja rigoroso: fonte
  tangencial fica abaixo de 50.
- "citationAbnt": referência em ABNT NBR 6023, ou null se faltarem dados.

Descarte fontes irrelevantes, quebradas ou que sejam só páginas de índice/busca.
Responda APENAS com JSON: {"overview": "síntese do estado da arte em 3-5 frases", "references": [...]}`

async function analyzeHits(
  topic: string,
  hits: WebSearchHit[],
  opts: AgentOptions
): Promise<{ overview: string; references: AgentReference[]; tokens: number }> {
  const openai = getOpenAI()

  const payload = hits.map((h, i) => ({
    index: i,
    title: h.title,
    url: h.url,
    publishedDate: h.publishedDate,
    excerpt: h.content.slice(0, 4000),
  }))

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: ANALYST_PROMPT },
      {
        role: 'user',
        content: [
          `TEMA DE PESQUISA DO USUÁRIO:\n"${topic}"`,
          '',
          `FONTES ENCONTRADAS (JSON):`,
          JSON.stringify(payload),
          '',
          `Devolva no máximo ${opts.limit ?? 12} referências, ordenadas por relevanceScore decrescente.`,
        ].join('\n'),
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw) as {
    overview?: string
    references?: Array<Partial<AgentReference> & { url?: string }>
  }

  const references: AgentReference[] = (parsed.references ?? [])
    .filter((r): r is Partial<AgentReference> & { url: string } => Boolean(r.url && r.title))
    .map((r) => ({
      kind: (r.kind ?? 'OTHER') as ReferenceKind,
      title: r.title!,
      url: r.url,
      source: r.source ?? null,
      publishedAt: r.publishedAt ?? null,
      authors: r.authors ?? [],
      summary: r.summary ?? '',
      relevance: r.relevance ?? '',
      relevanceScore: Math.max(0, Math.min(100, Math.round(r.relevanceScore ?? 0))),
      citationAbnt: r.citationAbnt ?? null,
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, opts.limit ?? 12)

  return {
    overview: parsed.overview ?? '',
    references,
    tokens: completion.usage?.total_tokens ?? 0,
  }
}

// ------------------------------- ORQUESTRADOR ------------------------------

/**
 * Executa o pipeline completo. Chamado pela Server Action
 * `buscarReferencias` (src/app/actions/references.ts).
 */
export async function runReferenceAgent(
  topic: string,
  opts: AgentOptions = {}
): Promise<AgentResult> {
  const startedAt = Date.now()

  // 1. Planejar
  const plan = await planQueries(topic, opts)

  // 2. Buscar
  const hits = await multiSearch(plan.queries, {
    maxResults: 6,
    depth: 'advanced',
  })

  if (hits.length === 0) {
    return {
      summary: 'Nenhuma fonte foi encontrada para este tema. Tente reformular com termos mais amplos.',
      expandedQueries: plan.queries,
      references: [],
      model: MODEL,
      searchProvider: activeSearchProvider(),
      tokensUsed: plan.tokens,
      durationMs: Date.now() - startedAt,
    }
  }

  // 3. Analisar — limitamos a 20 paginas por rodada para segurar custo e contexto.
  const analysis = await analyzeHits(topic, hits.slice(0, 20), opts)

  return {
    summary: analysis.overview || plan.reading,
    expandedQueries: plan.queries,
    references: analysis.references,
    model: MODEL,
    searchProvider: activeSearchProvider(),
    tokensUsed: plan.tokens + analysis.tokens,
    durationMs: Date.now() - startedAt,
  }
}
