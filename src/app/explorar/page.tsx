import Link from 'next/link'
import type { Metadata } from 'next'
import { TrendingUp } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { ArticleCard } from '@/components/feed/article-card'
import { Card } from '@/components/ui/card'
import { getFeed } from '@/lib/queries'
import { trendingTopics } from '@/lib/mock-data'
import { formatCount } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Explorar',
  description: 'Descubra artigos por área de pesquisa.',
}

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const posts = await getFeed(30)

  const filtered = tag ? posts.filter((p) => p.tags.some((t) => t.slug === tag)) : posts
  const activeTopic = trendingTopics.find((t) => t.slug === tag)

  return (
    <AppShell>
      <PageHeader
        title={activeTopic ? activeTopic.label : 'Explorar'}
        subtitle={
          activeTopic
            ? `${formatCount(activeTopic.posts)} publicações nesta área`
            : 'Áreas de pesquisa em alta'
        }
      />

      {!tag && (
        <div className="border-b border-border p-4 sm:p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="size-4 text-muted-foreground" />
            Áreas em alta
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {trendingTopics.map((topic) => (
              <Link key={topic.slug} href={`/explorar?tag=${topic.slug}`}>
                <Card className="p-3.5 transition-colors hover:bg-accent">
                  <p className="text-sm font-semibold">{topic.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCount(topic.posts)} publicações · {topic.growth}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Nenhum artigo encontrado nesta área ainda.
        </p>
      ) : (
        filtered.map((post) => <ArticleCard key={post.id} post={post} />)
      )}
    </AppShell>
  )
}
