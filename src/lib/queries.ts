// Modulo exclusivo de servidor.
import { prisma } from './prisma'
import { features } from './env'
import { mockPosts, mockComments, mockArticleBody } from './mock-data'
import type { ArticlePost, PeerComment } from '@/types'

// ---------------------------------------------------------------------------
// Camada de leitura.
//
// Sem DATABASE_URL a aplicacao serve os dados de demonstracao, para que a
// interface possa ser avaliada antes de provisionar o banco. Assim que a
// variavel existir no .env, as mesmas funcoes passam a consultar o Postgres.
// ---------------------------------------------------------------------------

/** Feed principal, ordenado por data de publicacao. */
export async function getFeed(limit = 20): Promise<ArticlePost[]> {
  if (!features.database) return mockPosts

  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: {
      author: true,
      tags: true,
      ratings: { select: { score: true } },
      _count: { select: { likes: true, comments: true } },
    },
  })

  return posts.map(serializePost)
}

/** Artigo completo para a pagina de leitura. */
export async function getPost(id: string): Promise<ArticlePost | null> {
  if (!features.database) {
    const post = mockPosts.find((p) => p.id === id) ?? mockPosts[0]
    return post ? { ...post, content: mockArticleBody } : null
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      tags: true,
      ratings: { select: { score: true } },
      _count: { select: { likes: true, comments: true } },
    },
  })

  if (!post) return null

  // Contador de visualizacoes (fire-and-forget: nao trava o render).
  prisma.post
    .update({ where: { id }, data: { viewCount: { increment: 1 } } })
    .catch((e) => console.error('[getPost] viewCount:', e))

  return serializePost(post)
}

/** Comentarios do artigo, ja montados em arvore (threads). */
export async function getComments(postId: string): Promise<PeerComment[]> {
  if (!features.database) return mockComments

  const rows = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: { author: true },
  })

  const byId = new Map<string, PeerComment>()
  const roots: PeerComment[] = []

  for (const row of rows) {
    byId.set(row.id, {
      id: row.id,
      kind: row.kind,
      body: row.body,
      author: {
        id: row.author.id,
        name: row.author.name,
        handle: row.author.handle,
        avatarUrl: row.author.avatarUrl,
        institution: row.author.institution,
        field: row.author.field,
      },
      createdAt: row.createdAt.toISOString(),
      upvotes: row.upvotes,
      isResolved: row.isResolved,
      quotedText: row.quotedText,
      pageNumber: row.pageNumber,
      replies: [],
    })
  }

  for (const row of rows) {
    const node = byId.get(row.id)!
    if (row.parentId && byId.has(row.parentId)) byId.get(row.parentId)!.replies.push(node)
    else roots.push(node)
  }

  return roots
}

// -------------------------------- helpers ---------------------------------

type PostWithRelations = Awaited<ReturnType<typeof prisma.post.findMany>>[number] & {
  author: { id: string; name: string; handle: string; avatarUrl: string | null; institution: string | null; field: string | null }
  tags: Array<{ slug: string; label: string }>
  ratings: Array<{ score: number }>
  _count: { likes: number; comments: number }
}

/** Converte o registro do Prisma no tipo serializavel enviado ao cliente. */
function serializePost(post: PostWithRelations): ArticlePost {
  const ratingCount = post.ratings.length
  const ratingAverage =
    ratingCount > 0 ? post.ratings.reduce((sum, r) => sum + r.score, 0) / ratingCount : 0

  return {
    id: post.id,
    title: post.title,
    abstract: post.abstract,
    content: post.content,
    author: {
      id: post.author.id,
      name: post.author.name,
      handle: post.author.handle,
      avatarUrl: post.author.avatarUrl,
      institution: post.author.institution,
      field: post.author.field,
    },
    tags: post.tags.map((t) => ({ slug: t.slug, label: t.label })),
    fileType: post.fileType,
    fileName: post.fileName,
    fileUrl: post.fileUrl,
    fileSize: post.fileSize,
    pageCount: post.pageCount,
    doi: post.doi,
    status: post.status,
    publishedAt: post.publishedAt.toISOString(),
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    downloadCount: post.downloadCount,
    viewCount: post.viewCount,
    ratingAverage: Math.round(ratingAverage * 10) / 10,
    ratingCount,
    similarityScore: post.similarityScore,
  }
}
