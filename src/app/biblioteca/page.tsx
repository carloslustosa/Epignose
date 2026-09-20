import type { Metadata } from 'next'
import { Bookmark, FolderOpen } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { ArticleCard } from '@/components/feed/article-card'
import { Card } from '@/components/ui/card'
import { getFeed } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Biblioteca',
  description: 'Artigos salvos e referências guardadas pelo Buscador de IA.',
}

// ---------------------------------------------------------------------------
// BIBLIOTECA — artigos salvos + referencias marcadas no Buscador IA.
//
// Com banco, troque `saved` por:
//   prisma.savedPost.findMany({ where: { userId }, include: { post: ... } })
// e liste tambem ReferenceResult onde isSaved = true.
// ---------------------------------------------------------------------------

export default async function BibliotecaPage() {
  const posts = await getFeed(20)
  const saved = posts.slice(0, 2) // placeholder ate existir o model SavedPost

  return (
    <AppShell>
      <PageHeader title="Biblioteca" subtitle="Seus artigos salvos e referências guardadas" />

      <div className="border-b border-border p-4 sm:p-5">
        <Card className="flex items-start gap-3 p-4">
          <FolderOpen className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">Referências do Buscador IA</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              As referências que você salvar nas buscas aparecem aqui, com o resumo e a
              análise de adequação preservados, prontas para exportar em ABNT.
            </p>
          </div>
        </Card>
      </div>

      <h2 className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-semibold sm:px-5">
        <Bookmark className="size-4 text-muted-foreground" />
        Artigos salvos
      </h2>

      {saved.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Você ainda não salvou nenhum artigo.
        </p>
      ) : (
        saved.map((post) => <ArticleCard key={post.id} post={post} />)
      )}
    </AppShell>
  )
}
