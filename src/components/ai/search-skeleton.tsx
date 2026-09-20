import { Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Estado de carregamento do agente. As etapas listadas correspondem ao
 * pipeline real em src/lib/ai/reference-agent.ts.
 */
export function SearchSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
          <Loader2 className="size-4 animate-spin" />
          O agente está trabalhando…
        </div>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
              1
            </span>
            Reescrevendo seu tema em consultas especializadas
          </li>
          <li className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
              2
            </span>
            Varrendo a web atrás de jurisprudência, doutrina, artigos e notícias
          </li>
          <li className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
              3
            </span>
            Analisando a adequação de cada fonte ao seu recorte
          </li>
        </ol>
      </Card>

      {[0, 1, 2].map((i) => (
        <Card key={i} className="space-y-3 p-5">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </Card>
      ))}
    </div>
  )
}
