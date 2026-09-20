import type { Metadata } from 'next'
import { Sparkles, Globe, Target, BookMarked } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { ReferenceSearch } from '@/components/ai/reference-search'

// ---------------------------------------------------------------------------
// BUSCADOR DE REFERENCIAS IA — pagina dedicada.
// Sem o sidebar direito: os cards de resultado precisam da largura.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Buscador de Referências IA',
  description:
    'Descreva seu tema de pesquisa e a IA varre a web atrás de jurisprudência, doutrina, artigos e notícias — explicando a adequação de cada fonte ao seu recorte.',
}

const FEATURES = [
  {
    icon: Globe,
    title: 'Busca real na web',
    description:
      'Jurisprudência, doutrina, artigos científicos, legislação e reportagens — em fontes abertas, no momento da consulta.',
  },
  {
    icon: Target,
    title: 'Adequação ao seu tema',
    description:
      'Para cada fonte, um parágrafo explicando como ela se encaixa no seu recorte específico e em que seção do trabalho ela cabe.',
  },
  {
    icon: BookMarked,
    title: 'Citação pronta',
    description:
      'Referência formatada em ABNT NBR 6023, pronta para copiar direto para o seu trabalho.',
  },
]

export default function BuscadorIaPage() {
  return (
    <AppShell showRightSidebar={false}>
      <PageHeader
        title="Buscador de Referências"
        subtitle="Agente de IA com busca na web em tempo real"
      />

      <div className="px-4 py-6 sm:px-6">
        {/* Apresentacao */}
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            Assistente de pesquisa
          </div>
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight">
            Diga o seu tema. A IA encontra e justifica cada referência.
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Quanto mais específico o recorte, melhor o resultado. Em vez de
            &ldquo;inteligência artificial&rdquo;, escreva &ldquo;limites do uso de IA na
            fundamentação de decisões judiciais no processo civil brasileiro&rdquo;.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-lg border border-border p-3.5">
                <Icon className="mb-2 size-4 text-primary" />
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <ReferenceSearch />
      </div>
    </AppShell>
  )
}
