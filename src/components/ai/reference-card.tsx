'use client'

import * as React from 'react'
import {
  ExternalLink,
  Gavel,
  BookOpen,
  FileText,
  Newspaper,
  Scale,
  Library,
  Link2,
  Copy,
  Check,
  Target,
  Bookmark,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { REFERENCE_KIND_LABEL, type ReferenceKind, type ReferenceResultItem } from '@/types'

// ---------------------------------------------------------------------------
// CARD DE REFERENCIA — saida do agente de IA.
//
// Estrutura exigida pelo produto:
//   1. Titulo + link da referencia
//   2. Resumo da referencia (gerado pela IA)
//   3. ADEQUACAO — paragrafo explicando como aquela referencia se encaixa
//      no tema EXATO do usuario. Recebe destaque visual proprio.
// ---------------------------------------------------------------------------

const KIND_ICON: Record<ReferenceKind, React.ComponentType<{ className?: string }>> = {
  JURISPRUDENCE: Gavel,
  DOCTRINE: BookOpen,
  ARTICLE: FileText,
  BOOK: Library,
  NEWS: Newspaper,
  LEGISLATION: Scale,
  OTHER: Link2,
}

const KIND_STYLE: Record<ReferenceKind, string> = {
  JURISPRUDENCE: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
  DOCTRINE: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  ARTICLE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  BOOK: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  NEWS: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
  LEGISLATION: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  OTHER: 'bg-muted text-muted-foreground',
}

export function ReferenceCard({ reference }: { reference: ReferenceResultItem }) {
  const Icon = KIND_ICON[reference.kind]
  const [copied, setCopied] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  function copyCitation() {
    if (!reference.citationAbnt) return
    void navigator.clipboard.writeText(reference.citationAbnt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Card className="animate-fade-in overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-5">
        {/* ---- Cabecalho: tipo, origem, aderencia ---- */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              KIND_STYLE[reference.kind]
            )}
          >
            <Icon className="size-3.5" />
            {REFERENCE_KIND_LABEL[reference.kind]}
          </span>

          {reference.source && (
            <span className="text-xs text-muted-foreground">{reference.source}</span>
          )}
          {reference.publishedAt && (
            <span className="text-xs text-muted-foreground">
              · {new Date(reference.publishedAt).getFullYear()}
            </span>
          )}

          <span className="ml-auto flex items-center gap-1.5">
            <RelevanceMeter score={reference.relevanceScore} />
          </span>
        </div>

        {/* ---- 1. Titulo + link ---- */}
        <h3 className="text-[17px] font-semibold leading-snug tracking-tight">
          <a
            href={reference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-start gap-1.5 hover:text-primary hover:underline"
          >
            {reference.title}
            <ExternalLink className="mt-1 size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        </h3>

        {reference.authors.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">{reference.authors.join('; ')}</p>
        )}

        {/* ---- 2. Resumo da referencia ---- */}
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Resumo
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">{reference.summary}</p>
        </div>

        {/* ---- 3. ADEQUACAO ao tema do usuario (destaque) ---- */}
        <div className="mt-4 rounded-lg border-l-[3px] border-primary bg-primary/5 p-4">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <Target className="size-3.5" />
            Adequação ao seu tema
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">{reference.relevance}</p>
        </div>

        {/* ---- Citacao ABNT + acoes ---- */}
        {reference.citationAbnt && (
          <div className="mt-4 rounded-lg bg-muted/60 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Referência (ABNT)
            </p>
            <p className="font-mono text-xs leading-relaxed text-muted-foreground">
              {reference.citationAbnt}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 border-t border-border px-3 py-2">
        <Button variant="ghost" size="sm" asChild>
          <a href={reference.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            Abrir fonte
          </a>
        </Button>

        {reference.citationAbnt && (
          <Button variant="ghost" size="sm" onClick={copyCitation}>
            {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
            {copied ? 'Copiado' : 'Copiar citação'}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={cn('ml-auto', saved && 'text-primary')}
          onClick={() => setSaved((v) => !v)}
        >
          <Bookmark className={cn('size-4', saved && 'fill-current')} />
          {saved ? 'Salvo' : 'Salvar'}
        </Button>
      </div>
    </Card>
  )
}

/** Barra de aderencia 0-100 ao tema informado. */
function RelevanceMeter({ score }: { score: number }) {
  const tone =
    score >= 80
      ? 'bg-emerald-500'
      : score >= 60
        ? 'bg-amber-500'
        : 'bg-muted-foreground/40'

  return (
    <span
      className="flex items-center gap-1.5"
      title={`Aderência ao tema: ${score}/100`}
      aria-label={`Aderência ao tema: ${score} de 100`}
    >
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
        <span className={cn('block h-full rounded-full', tone)} style={{ width: `${score}%` }} />
      </span>
      <span className="text-xs font-semibold tabular-nums text-muted-foreground">{score}</span>
    </span>
  )
}
