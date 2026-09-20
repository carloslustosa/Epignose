import Link from 'next/link'
import { Search, TrendingUp, BadgeCheck, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { initials, formatCount } from '@/lib/utils'
import { trendingTopics, suggestedResearchers } from '@/lib/mock-data'

// ---------------------------------------------------------------------------
// SIDEBAR DIREITO — busca, temas em alta e pesquisadores sugeridos.
// Oculto abaixo de lg para o feed ocupar a largura toda.
// ---------------------------------------------------------------------------

export function RightSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[350px] shrink-0 flex-col gap-4 overflow-y-auto py-5 pl-6 pr-4 lg:flex">
      {/* Busca global */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar artigos, autores, áreas"
          className="h-11 rounded-full bg-muted pl-10"
          aria-label="Buscar na plataforma"
        />
      </div>

      {/* CTA do Buscador IA */}
      <Card className="border-primary/20 bg-primary/5 p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Buscador de Referências</h2>
        </div>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          Descreva seu tema e a IA varre a web atrás de jurisprudência, doutrina e
          artigos — explicando a adequação de cada fonte ao seu recorte.
        </p>
        <Button asChild size="sm" className="w-full">
          <Link href="/buscador-ia">Buscar referências</Link>
        </Button>
      </Card>

      {/* Trending academico */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <TrendingUp className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Em alta na academia</h2>
        </div>
        <ul>
          {trendingTopics.map((topic, i) => (
            <li key={topic.slug}>
              <Link
                href={`/explorar?tag=${topic.slug}`}
                className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{i + 1} · Área de pesquisa</p>
                  <p className="truncate text-sm font-semibold">{topic.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCount(topic.posts)} publicações
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {topic.growth}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      {/* Pesquisadores sugeridos */}
      <Card className="overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Pesquisadores sugeridos</h2>
        </div>
        <ul>
          {suggestedResearchers.map((person) => (
            <li
              key={person.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent"
            >
              <Avatar className="size-10 shrink-0">
                {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt={person.name} /> : null}
                <AvatarFallback>{initials(person.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-semibold">
                  {person.name}
                  {person.verified && (
                    <BadgeCheck className="size-3.5 shrink-0 text-primary" aria-label="Verificado" />
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">{person.field}</p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0">
                Seguir
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <footer className="px-1 pb-6 text-xs leading-relaxed text-muted-foreground">
        <nav className="flex flex-wrap gap-x-3 gap-y-1">
          <Link href="/sobre" className="hover:underline">Sobre</Link>
          <Link href="/diretrizes" className="hover:underline">Diretrizes de revisão</Link>
          <Link href="/privacidade" className="hover:underline">Privacidade</Link>
          <Link href="/termos" className="hover:underline">Termos</Link>
        </nav>
        <p className="mt-2">© {new Date().getFullYear()} Epignose</p>
      </footer>
    </aside>
  )
}
