'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { features } from '@/lib/env'
import { getCurrentUser } from '@/lib/auth'
import { runReferenceAgent } from '@/lib/ai/reference-agent'
import { mockReferenceSearch } from '@/lib/mock-data'
import type { ReferenceKind, ReferenceSearchResult } from '@/types'

// ---------------------------------------------------------------------------
// SERVER ACTION do Buscador de Referencias IA.
//
// Chamada pelo formulario em src/components/ai/reference-search.tsx.
// Sem OPENAI_API_KEY + chave de busca, devolve o resultado de demonstracao
// com isDemo=true — a UI exibe o aviso correspondente.
// ---------------------------------------------------------------------------

const schema = z.object({
  topic: z
    .string()
    .min(12, 'Descreva o tema com pelo menos 12 caracteres.')
    .max(600, 'Tema muito longo — resuma em até 600 caracteres.'),
  kinds: z.array(z.string()).optional(),
  sinceYears: z.number().int().positive().max(50).optional(),
})

export interface SearchState {
  ok: boolean
  error?: string
  data?: ReferenceSearchResult
}

export async function buscarReferencias(
  _prev: SearchState | null,
  formData: FormData
): Promise<SearchState> {
  const parsed = schema.safeParse({
    topic: formData.get('topic'),
    kinds: formData.getAll('kinds').map(String),
    sinceYears: formData.get('sinceYears') ? Number(formData.get('sinceYears')) : undefined,
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const { topic, kinds, sinceYears } = parsed.data

  // ---- Modo demonstracao: sem chaves de API ----
  if (!features.openai || !features.webSearch) {
    return {
      ok: true,
      data: {
        ...mockReferenceSearch,
        topic,
        createdAt: new Date().toISOString(),
        isDemo: true,
      },
    }
  }

  const user = await getCurrentUser()

  // Registra a busca antes de executar, para nao perder o historico se falhar.
  let searchId = `rs-${Date.now()}`
  if (features.database && user) {
    const row = await prisma.referenceSearch.create({
      data: {
        topic,
        status: 'RUNNING',
        filters: { kinds, sinceYears },
        userId: user.id,
        expandedQueries: [],
      },
      select: { id: true },
    })
    searchId = row.id
  }

  try {
    const result = await runReferenceAgent(topic, {
      kinds: kinds as ReferenceKind[] | undefined,
      sinceYears,
      limit: 12,
    })

    // Persiste busca + resultados.
    if (features.database && user) {
      await prisma.referenceSearch.update({
        where: { id: searchId },
        data: {
          status: 'COMPLETED',
          summary: result.summary,
          expandedQueries: result.expandedQueries,
          model: result.model,
          searchProvider: result.searchProvider,
          tokensUsed: result.tokensUsed,
          durationMs: result.durationMs,
          results: {
            create: result.references.map((r) => ({
              kind: r.kind,
              title: r.title,
              url: r.url,
              source: r.source,
              publishedAt: r.publishedAt ? new Date(r.publishedAt) : null,
              authors: r.authors,
              summary: r.summary,
              relevance: r.relevance,
              relevanceScore: r.relevanceScore,
              citationAbnt: r.citationAbnt,
            })),
          },
        },
      })
    }

    return {
      ok: true,
      data: {
        id: searchId,
        topic,
        summary: result.summary,
        expandedQueries: result.expandedQueries,
        model: result.model,
        durationMs: result.durationMs,
        createdAt: new Date().toISOString(),
        results: result.references.map((r, i) => ({
          id: `${searchId}-${i}`,
          kind: r.kind,
          title: r.title,
          url: r.url,
          source: r.source,
          publishedAt: r.publishedAt,
          authors: r.authors,
          summary: r.summary,
          relevance: r.relevance,
          relevanceScore: r.relevanceScore,
          citationAbnt: r.citationAbnt,
        })),
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha inesperada na busca.'
    console.error('[buscarReferencias]', error)

    if (features.database && user) {
      await prisma.referenceSearch
        .update({ where: { id: searchId }, data: { status: 'FAILED', errorMessage: message } })
        .catch(() => {})
    }

    return { ok: false, error: message }
  }
}
