// ---------------------------------------------------------------------------
// Tipos compartilhados entre servidor e cliente.
// Espelham o schema do Prisma, mas sem importar @prisma/client em Client
// Components (o que puxaria o runtime do Prisma para o bundle do browser).
// ---------------------------------------------------------------------------

export type ReferenceKind =
  | 'JURISPRUDENCE'
  | 'DOCTRINE'
  | 'ARTICLE'
  | 'BOOK'
  | 'NEWS'
  | 'LEGISLATION'
  | 'OTHER'

export type CommentKind = 'COMMENT' | 'CONSTRUCTIVE' | 'METHODOLOGY' | 'REFERENCE_REQUEST'

export type FileType = 'PDF' | 'DOCX'

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'UNDER_REVIEW' | 'RETRACTED'

export interface Author {
  id: string
  name: string
  handle: string
  avatarUrl: string | null
  institution: string | null
  field: string | null
  verified?: boolean
}

export interface Tag {
  slug: string
  label: string
}

export interface ArticlePost {
  id: string
  title: string
  abstract: string
  content?: string | null
  author: Author
  tags: Tag[]
  fileType: FileType
  fileName: string
  fileUrl: string
  fileSize: number
  pageCount: number | null
  doi: string | null
  status: PostStatus
  publishedAt: string
  likeCount: number
  commentCount: number
  downloadCount: number
  viewCount: number
  ratingAverage: number
  ratingCount: number
  /** Marcado quando o anti-plagio encontrou similaridade acima do limite de alerta. */
  similarityScore?: number | null
  likedByMe?: boolean
}

export interface PeerComment {
  id: string
  kind: CommentKind
  body: string
  author: Author
  createdAt: string
  upvotes: number
  isResolved: boolean
  quotedText?: string | null
  pageNumber?: number | null
  replies: PeerComment[]
}

export interface ReferenceResultItem {
  id: string
  kind: ReferenceKind
  title: string
  url: string
  source: string | null
  publishedAt: string | null
  authors: string[]
  summary: string
  /** O paragrafo de ADEQUACAO ao tema do usuario. */
  relevance: string
  relevanceScore: number
  citationAbnt: string | null
}

export interface ReferenceSearchResult {
  id: string
  topic: string
  summary: string
  expandedQueries: string[]
  results: ReferenceResultItem[]
  model: string | null
  durationMs: number | null
  createdAt: string
  /** true quando a resposta veio dos dados de demonstracao (sem chaves de API). */
  isDemo?: boolean
}

export const REFERENCE_KIND_LABEL: Record<ReferenceKind, string> = {
  JURISPRUDENCE: 'Jurisprudência',
  DOCTRINE: 'Doutrina',
  ARTICLE: 'Artigo científico',
  BOOK: 'Livro',
  NEWS: 'Notícia',
  LEGISLATION: 'Legislação',
  OTHER: 'Outros',
}

export const COMMENT_KIND_LABEL: Record<CommentKind, string> = {
  COMMENT: 'Comentário',
  CONSTRUCTIVE: 'Crítica construtiva',
  METHODOLOGY: 'Apontamento metodológico',
  REFERENCE_REQUEST: 'Pedido de referência',
}
