import Link from 'next/link'
import {
  BadgeCheck,
  Download,
  FileText,
  Quote,
  Eye,
  Calendar,
  Building2,
  ShieldCheck,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StarRating } from '@/components/ui/star-rating'
import { formatBytes, formatCount, formatDate, initials } from '@/lib/utils'
import type { ArticlePost } from '@/types'

// ---------------------------------------------------------------------------
// ARTICLE VIEW — interface padronizada de leitura.
//
// Layout deliberadamente sobrio e de coluna estreita: medida de linha proxima
// de 70 caracteres, tipografia serifada e entrelinha alta (classe
// .prose-article em globals.css). A ideia e que qualquer artigo, venha de PDF
// ou DOCX, seja lido no MESMO formato — e o que o requisito chama de
// "interface padronizada de leitura".
// ---------------------------------------------------------------------------

export function ArticleView({ post }: { post: ArticlePost }) {
  return (
    <article>
      {/* ------------------------------ Cabecalho ------------------------------ */}
      <header className="border-b border-border px-5 py-6 sm:px-8">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Link key={tag.slug} href={`/explorar?tag=${tag.slug}`}>
              <Badge variant="default">{tag.label}</Badge>
            </Link>
          ))}
        </div>

        <h1 className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-[28px]">
          {post.title}
        </h1>

        {/* Autor */}
        <div className="mt-5 flex items-start gap-3">
          <Avatar className="size-12 shrink-0">
            {post.author.avatarUrl ? (
              <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            ) : null}
            <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 font-semibold">
              <Link href={`/perfil/${post.author.handle}`} className="hover:underline">
                {post.author.name}
              </Link>
              {post.author.verified && (
                <BadgeCheck className="size-4 text-primary" aria-label="Pesquisador verificado" />
              )}
            </p>
            {post.author.institution && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="size-3.5 shrink-0" />
                {post.author.institution}
              </p>
            )}
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </span>
              <span className="flex items-center gap-1">
                <Eye className="size-3.5" />
                {formatCount(post.viewCount)} leituras
              </span>
              <span className="flex items-center gap-1">
                <Download className="size-3.5" />
                {formatCount(post.downloadCount)} downloads
              </span>
            </p>
          </div>

          <Button variant="outline" size="sm" className="shrink-0">
            Seguir
          </Button>
        </div>

        {/* Avaliacao agregada dos pares */}
        {post.ratingCount > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <StarRating value={post.ratingAverage} readOnly />
            <span className="text-sm font-semibold">
              {post.ratingAverage.toFixed(1).replace('.', ',')}
            </span>
            <span className="text-sm text-muted-foreground">
              em {post.ratingCount} avaliações por pares
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
              Originalidade verificada
            </span>
          </div>
        )}

        {/* Faixa do arquivo */}
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="size-5 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{post.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {post.fileType} · {formatBytes(post.fileSize)}
              {post.pageCount ? ` · ${post.pageCount} páginas` : ''}
            </p>
          </div>
          <Button asChild size="sm">
            <a href={post.fileUrl} download={post.fileName}>
              <Download className="size-4" />
              Baixar {post.fileType}
            </a>
          </Button>
        </div>

        {post.doi && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Quote className="size-3.5" />
            DOI: <span className="font-mono">{post.doi}</span>
          </p>
        )}
      </header>

      {/* -------------------------------- Resumo ------------------------------- */}
      <section className="border-b border-border px-5 py-6 sm:px-8">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Resumo
        </h2>
        <p className="text-[15px] leading-relaxed text-foreground/90">{post.abstract}</p>
      </section>

      {/* -------------------------- Corpo do artigo ---------------------------- */}
      {post.content && (
        <section className="px-5 py-8 sm:px-8">
          <div className="prose-article mx-auto max-w-[68ch]">
            <ArticleBody content={post.content} />
          </div>
        </section>
      )}

      <Separator />
    </article>
  )
}

/**
 * Renderiza o texto extraido do documento.
 *
 * O parser aqui e proposital e mínimo: trata "## " como titulo de secao e
 * "> " como citacao, que e o suficiente para o texto que sai de um PDF/DOCX.
 * Se voce quiser Markdown completo (listas, tabelas, notas de rodape),
 * instale `react-markdown` + `remark-gfm` e troque esta funcao por:
 *
 *   <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
 */
function ArticleBody({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).filter((b) => b.trim())

  return (
    <>
      {blocks.map((block, i) => {
        const text = block.trim()

        if (text.startsWith('## ')) return <h2 key={i}>{text.slice(3)}</h2>
        if (text.startsWith('### ')) return <h3 key={i}>{text.slice(4)}</h3>
        if (text.startsWith('> ')) return <blockquote key={i}>{text.slice(2)}</blockquote>

        return <p key={i}>{renderInline(text)}</p>
      })}
    </>
  )
}

/** Suporte a **negrito** dentro do paragrafo. */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  )
}
