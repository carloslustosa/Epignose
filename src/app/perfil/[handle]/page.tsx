import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BadgeCheck, Building2, Link2, Calendar, FileText, Quote, Users } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { ArticleCard } from '@/components/feed/article-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getFeed } from '@/lib/queries'
import { getCurrentUser } from '@/lib/auth'
import { currentUser, suggestedResearchers } from '@/lib/mock-data'
import { formatCount, initials } from '@/lib/utils'
import type { Author } from '@/types'

// ---------------------------------------------------------------------------
// PERFIL DO PESQUISADOR — cabecalho com credenciais academicas + producao.
// ---------------------------------------------------------------------------

/** Localiza o pesquisador. Com banco, troque por uma query em User. */
async function findAuthor(handle: string): Promise<Author | null> {
  const people = [currentUser, ...suggestedResearchers]
  const posts = await getFeed(50)
  const fromPosts = posts.map((p) => p.author)

  return (
    [...people, ...fromPosts].find((p) => p.handle.toLowerCase() === handle.toLowerCase()) ?? null
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const author = await findAuthor(handle)
  if (!author) return { title: 'Perfil não encontrado' }

  return {
    title: author.name,
    description: `${author.name} — ${author.field ?? 'Pesquisador'}${author.institution ? ` · ${author.institution}` : ''}`,
  }
}

export default async function PerfilPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const [author, allPosts, me] = await Promise.all([
    findAuthor(handle),
    getFeed(50),
    getCurrentUser(),
  ])

  if (!author) notFound()

  const posts = allPosts.filter((p) => p.author.handle === author.handle)
  const isMe = me?.handle === author.handle

  const citations = posts.reduce((sum, p) => sum + p.downloadCount, 0)
  const reviews = posts.reduce((sum, p) => sum + p.commentCount, 0)

  return (
    <AppShell>
      <PageHeader
        title={author.name}
        subtitle={`${posts.length} ${posts.length === 1 ? 'publicação' : 'publicações'}`}
      />

      <header className="border-b border-border px-4 py-6 sm:px-5">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar className="size-20 shrink-0">
            {author.avatarUrl ? <AvatarImage src={author.avatarUrl} alt={author.name} /> : null}
            <AvatarFallback className="text-xl">{initials(author.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-1.5 text-xl font-bold tracking-tight">
              {author.name}
              {author.verified && (
                <BadgeCheck className="size-5 text-primary" aria-label="Pesquisador verificado" />
              )}
            </h1>
            <p className="text-sm text-muted-foreground">@{author.handle}</p>

            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              {author.institution && (
                <p className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 shrink-0" />
                  {author.institution}
                </p>
              )}
              {author.field && (
                <p className="flex items-center gap-1.5">
                  <Link2 className="size-3.5 shrink-0" />
                  {author.field}
                </p>
              )}
              <p className="flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" />
                Na plataforma desde 2025
              </p>
            </div>
          </div>

          <Button variant={isMe ? 'outline' : 'default'} className="shrink-0">
            {isMe ? 'Editar perfil' : 'Seguir'}
          </Button>
        </div>

        {/* Metricas academicas */}
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={FileText} label="Publicações" value={posts.length} />
          <Stat icon={Quote} label="Downloads" value={citations} />
          <Stat icon={Users} label="Revisões recebidas" value={reviews} />
          <Stat icon={Users} label="Seguidores" value={342} />
        </dl>

        {author.field && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Badge variant="default">{author.field}</Badge>
          </div>
        )}
      </header>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {isMe
            ? 'Você ainda não publicou nenhum artigo.'
            : 'Este pesquisador ainda não publicou artigos.'}
        </p>
      ) : (
        posts.map((post) => <ArticleCard key={post.id} post={post} />)
      )}
    </AppShell>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-border px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums">{formatCount(value)}</dd>
    </div>
  )
}
