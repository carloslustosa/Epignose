import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { FeedTabs } from '@/components/feed/feed-tabs'
import { ComposeBox } from '@/components/feed/compose-box'
import { ArticleCard } from '@/components/feed/article-card'
import { DemoBanner } from '@/components/feed/demo-banner'
import { getFeed } from '@/lib/queries'
import { getCurrentUser } from '@/lib/auth'
import { currentUser as fallbackUser } from '@/lib/mock-data'
import { features } from '@/lib/env'

// ---------------------------------------------------------------------------
// FEED PRINCIPAL — a home, estilo X/Instagram.
// Server Component: busca os posts no servidor e envia HTML pronto.
// ---------------------------------------------------------------------------

export default async function HomePage() {
  const [posts, user] = await Promise.all([getFeed(), getCurrentUser()])

  const missing = [
    !features.database && 'DATABASE_URL',
    !features.storage && 'chaves do Storage',
    !features.openai && 'OPENAI_API_KEY',
  ].filter(Boolean) as string[]

  return (
    <AppShell>
      <PageHeader title="Início" subtitle="Artigos da sua rede e das suas áreas">
        <div className="-mx-4 mt-2 sm:-mx-5">
          <FeedTabs />
        </div>
      </PageHeader>

      <DemoBanner missing={missing} />
      <ComposeBox user={user ?? fallbackUser} />

      <div>
        {posts.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>

      <p className="py-10 text-center text-sm text-muted-foreground">
        Você chegou ao fim do feed.
      </p>
    </AppShell>
  )
}
