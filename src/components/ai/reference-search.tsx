'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { Sparkles, Loader2, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { buscarReferencias, type SearchState } from '@/app/actions/references'
import { REFERENCE_KIND_LABEL, type ReferenceKind } from '@/types'
import { ReferenceCard } from './reference-card'
import { SearchSkeleton } from './search-skeleton'

// ---------------------------------------------------------------------------
// BUSCADOR DE REFERENCIAS IA — formulario + resultados.
//
// O formulario chama a Server Action `buscarReferencias`, que roda o pipeline
// em src/lib/ai/reference-agent.ts (planejar -> buscar na web -> analisar).
// ---------------------------------------------------------------------------

const KINDS = Object.keys(REFERENCE_KIND_LABEL) as ReferenceKind[]

const EXAMPLES = [
  'Aplicação da IA na tomada de decisão judicial',
  'Impacto do trabalho remoto na saúde mental de docentes',
  'Responsabilidade civil por danos causados por veículos autônomos',
  'Eficácia de políticas de cota racial no ensino superior brasileiro',
]

export function ReferenceSearch() {
  // React 19: useActionState devolve tambem o estado pendente da action,
  // o que dispensa o useFormStatus (que so funciona dentro do <form>).
  const [state, formAction, isPending] = useActionState<SearchState | null, FormData>(
    buscarReferencias,
    null
  )
  const [topic, setTopic] = React.useState('')
  const [selectedKinds, setSelectedKinds] = React.useState<ReferenceKind[]>([])
  const [showFilters, setShowFilters] = React.useState(false)

  function toggleKind(kind: ReferenceKind) {
    setSelectedKinds((prev) =>
      prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind]
    )
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------ Formulario ------------------------------ */}
      <form action={formAction} className="space-y-3">
        <Card className="overflow-hidden border-primary/20">
          <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-4 py-2.5">
            <Sparkles className="size-4 text-primary" />
            <span className="text-sm font-semibold">Qual é o seu tema de pesquisa?</span>
          </div>

          <Textarea
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            minLength={12}
            maxLength={600}
            rows={3}
            placeholder="Ex.: Aplicação da IA na tomada de decisão judicial — limites do dever de fundamentação no processo civil brasileiro"
            className="resize-none rounded-none border-0 text-[15px] leading-relaxed focus-visible:ring-0"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters((v) => !v)}
                className={cn(showFilters && 'bg-accent')}
              >
                <SlidersHorizontal className="size-4" />
                Filtros
                {selectedKinds.length > 0 && (
                  <span className="ml-0.5 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {selectedKinds.length}
                  </span>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">{topic.length}/600</span>
            </div>
            <SubmitButton disabled={topic.trim().length < 12} pending={isPending} />
          </div>

          {/* Filtros: tipos de fonte + recorte temporal */}
          {showFilters && (
            <div className="space-y-3 border-t border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Tipos de fonte (vazio = todos)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {KINDS.map((kind) => {
                    const active = selectedKinds.includes(kind)
                    return (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => toggleKind(kind)}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:bg-accent'
                        )}
                      >
                        {REFERENCE_KIND_LABEL[kind]}
                      </button>
                    )
                  })}
                </div>
                {/* Os tipos escolhidos viajam como campos ocultos do form. */}
                {selectedKinds.map((k) => (
                  <input key={k} type="hidden" name="kinds" value={k} />
                ))}
              </div>

              <div>
                <label
                  htmlFor="sinceYears"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Recorte temporal
                </label>
                <select
                  id="sinceYears"
                  name="sinceYears"
                  defaultValue=""
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Sem restrição</option>
                  <option value="2">Últimos 2 anos</option>
                  <option value="5">Últimos 5 anos</option>
                  <option value="10">Últimos 10 anos</option>
                </select>
              </div>
            </div>
          )}
        </Card>

        {/* Sugestoes de tema */}
        {!state?.data && (
          <div className="flex flex-wrap gap-1.5">
            <span className="py-1 text-xs text-muted-foreground">Exemplos:</span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setTopic(example)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* -------------------------------- Erro -------------------------------- */}
      {state && !state.ok && state.error && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {state.error}
        </Card>
      )}

      {/* ------------------------------ Resultados ----------------------------- */}
      <ResultsArea state={state} pending={isPending} />
    </div>
  )
}

/** Botao de envio que reage ao estado pendente da Server Action. */
function SubmitButton({ disabled, pending }: { disabled: boolean; pending: boolean }) {
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Varrendo a web…
        </>
      ) : (
        <>
          <Search className="size-4" />
          Buscar referências
        </>
      )}
    </Button>
  )
}

/** Skeleton enquanto a action roda; resultados quando ela volta. */
function ResultsArea({ state, pending }: { state: SearchState | null; pending: boolean }) {
  if (pending) return <SearchSkeleton />
  if (!state?.ok || !state.data) return null

  const { data } = state

  return (
    <section className="animate-fade-in space-y-4" aria-live="polite">
      {data.isDemo && (
        <Card className="border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          <strong className="font-semibold">Resultado de demonstração.</strong> Defina{' '}
          <code className="font-mono">OPENAI_API_KEY</code> e{' '}
          <code className="font-mono">TAVILY_API_KEY</code> no <code className="font-mono">.env</code>{' '}
          para que a busca real na web seja executada.
        </Card>
      )}

      {/* Sintese do estado da arte */}
      {data.summary && (
        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Síntese do tema</h2>
          </div>
          <p className="text-[15px] leading-relaxed text-foreground/90">{data.summary}</p>

          {data.expandedQueries.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                Consultas executadas na web ({data.expandedQueries.length})
              </summary>
              <ul className="mt-2 space-y-1">
                {data.expandedQueries.map((query, i) => (
                  <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                    <Search className="mt-0.5 size-3 shrink-0" />
                    <span className="font-mono">{query}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Card>
      )}

      {/* Cabecalho da lista */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">
          {data.results.length} referência{data.results.length === 1 ? '' : 's'} encontrada
          {data.results.length === 1 ? '' : 's'}
        </h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {data.model && <Badge variant="secondary">{data.model}</Badge>}
          {data.durationMs && <span>{(data.durationMs / 1000).toFixed(1).replace('.', ',')}s</span>}
        </div>
      </div>

      {/* Cards: Resumo + Adequacao */}
      <div className="space-y-4">
        {data.results.map((reference) => (
          <ReferenceCard key={reference.id} reference={reference} />
        ))}
      </div>
    </section>
  )
}
