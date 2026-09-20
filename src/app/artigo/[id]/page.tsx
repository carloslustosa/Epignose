import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Share2, Bookmark } from 'lucide-react'
import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/app-shell'
import { ArticleView } from '@/components/article/article-view'
import { PeerReview } from '@/components/article/peer-review'
import { Button } from '@/components/ui/button'
import { getPost, getComments } from '@/lib/queries'
import { getCurrentUser } from '@/lib/auth'
import { currentUser as fallbackUser } from '@/lib/mock-data'
import { truncate } from '@/lib/utils'

// ---------------------------------------------------------------------------
// PAGINA DE LEITURA DO ARTIGO
// Cabecalho fixo + ArticleView (leitura padronizada) + PeerReview (threads).
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)
  if (!post) return { title: 'Artigo não encontrado' }

  return {
    title: post.title,
    description: truncate(post.abstract, 160),
    openGraph: {
      title: post.title,
      description: truncate(post.abstract, 200),
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, comments, user] = await Promise.all([
    getPost(id),
    getComments(id),
    getCurrentUser(),
  ])

  if (!post) notFound()

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-2.5 backdrop-blur-md sm:px-5">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Voltar ao feed">
          <Link href="/">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Artigo</p>
          <p className="truncate text-xs text-muted-foreground">{post.author.name}</p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Salvar na biblioteca">
          <Bookmark />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Compartilhar">
          <Share2 />
        </Button>
      </header>

      <ArticleView post={post} />
      <PeerReview postId={post.id} comments={comments} currentUser={user ?? fallbackUser} />
    </AppShell>
  )
}
