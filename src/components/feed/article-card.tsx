'use client'

import Link from 'next/link'
import * as React from 'react'
import {
  Heart,
  MessageSquareQuote,
  Download,
  Share2,
  BadgeCheck,
  FileText,
  Quote,
  ShieldAlert,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/star-rating'
import { cn, formatBytes, formatCount, initials, timeAgo, truncate } from '@/lib/utils'
import { alternarCurtida, registrarDownload } from '@/app/actions/posts'
import type { ArticlePost } from '@/types'

// ---------------------------------------------------------------------------
// CARD DO ARTIGO NO FEED
//
// Exibe: titulo, autor (+instituicao), abstract resumido, tags da area e a
// barra de interacao — Curtir, Comentar/Criticar, Baixar PDF/DOCX.
// O card inteiro leva a pagina de leitura; os botoes param a propagacao.
// ---------------------------------------------------------------------------

export function ArticleCard({ post }: { post: ArticlePost }) {
  const [liked, setLiked] = React.useState(Boolean(post.likedByMe))
  const [likeCount, setLikeCount] = React.useState(post.likeCount)
  const [pending, startTransition] = React.useTransition()

  function handleLike(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    // Atualizacao otimista: a UI responde na hora e reverte se a action falhar.
    const next = !liked
    setLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))

    startTransition(async () => {
      const res = await alternarCurtida(post.id)
      if (!res.ok) {
        setLiked(!next)
        setLikeCount((c) => c + (next ? -1 : 1))
      }
    })
  }

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
    void registrarDownload(post.id)
  }

  return (
    // Padrao "stretched link": o card inteiro e clicavel atraves do
    // pseudo-elemento do link do titulo, em vez de um <a> envolvendo tudo.
    // Assim a barra de acoes pode conter <a> e <button> sem aninhar
    // elementos interativos dentro de um link — HTML invalido que o parser
    // do browser reescreve, quebrando a hidratacao do React.
    <article className="group/card relative animate-fade-in border-b border-border px-4 py-4 transition-colors hover:bg-accent/40 sm:px-5">
      <div>
        <div className="flex gap-3">
          {/* Avatar do autor */}
          <Avatar className="size-11 shrink-0">
            {post.author.avatarUrl ? (
              <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            ) : null}
            <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            {/* Linha do autor */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm">
              <Link
                href={`/perfil/${post.author.handle}`}
                className="relative z-10 font-semibold hover:underline"
              >
                {post.author.name}
              </Link>
              {post.author.verified && (
                <BadgeCheck className="size-4 text-primary" aria-label="Pesquisador verificado" />
              )}
              <span className="text-muted-foreground">@{post.author.handle}</span>
              <span className="text-muted-foreground">·</span>
              <time className="text-muted-foreground" dateTime={post.publishedAt}>
                {timeAgo(post.publishedAt)}
              </time>
            </div>
            {post.author.institution && (
              <p className="truncate text-xs text-muted-foreground">{post.author.institution}</p>
            )}

            {/* Titulo do artigo — este e o link que cobre o card inteiro */}
            <h2 className="mt-2.5 text-[17px] font-semibold leading-snug tracking-tight">
              <Link
                href={`/artigo/${post.id}`}
                className="after:absolute after:inset-0 after:content-['']"
              >
                {post.title}
              </Link>
            </h2>

            {/* Abstract resumido */}
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {truncate(post.abstract, 280)}
            </p>

            {/* Tags da area de pesquisa */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link key={tag.slug} href={`/explorar?tag=${tag.slug}`} className="relative z-10">
                  <Badge variant="default">{tag.label}</Badge>
                </Link>
              ))}
            </div>

            {/* Faixa do arquivo + avaliacao dos pares */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
              <span className="flex items-center gap-1.5 text-xs font-medium">
                <FileText className="size-4 text-primary" />
                {post.fileType}
                <span className="font-normal text-muted-foreground">
                  · {formatBytes(post.fileSize)}
                  {post.pageCount ? ` · ${post.pageCount} p.` : ''}
                </span>
              </span>

              {post.ratingCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <StarRating value={post.ratingAverage} size="sm" readOnly />
                  {post.ratingAverage.toFixed(1).replace('.', ',')}
                  <span>({post.ratingCount} avaliações)</span>
                </span>
              )}

              {post.doi && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Quote className="size-3.5" />
                  DOI {post.doi}
                </span>
              )}
            </div>

            {/* Alerta do anti-plagio, quando houver similaridade relevante */}
            {typeof post.similarityScore === 'number' && post.similarityScore >= 35 && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                <ShieldAlert className="mt-px size-3.5 shrink-0" />
                Similaridade de {post.similarityScore.toFixed(1).replace('.', ',')}% com outro
                documento da base — sinalizado para revisão.
              </p>
            )}

            {/* Barra de interacao */}
            <div className="relative z-10 mt-3 flex items-center justify-between pr-2">
              <ActionButton
                onClick={handleLike}
                active={liked}
                disabled={pending}
                icon={<Heart className={cn('size-[18px]', liked && 'fill-current')} />}
                label={formatCount(likeCount)}
                srLabel={liked ? 'Remover curtida' : 'Curtir'}
                activeClass="text-rose-600 dark:text-rose-400"
                hoverClass="group-hover:bg-rose-500/10 group-hover:text-rose-600 dark:group-hover:text-rose-400"
              />

              <ActionButton
                internalHref={`/artigo/${post.id}#revisao`}
                icon={<MessageSquareQuote className="size-[18px]" />}
                label={formatCount(post.commentCount)}
                srLabel="Comentar ou criticar"
                hoverClass="group-hover:bg-primary/10 group-hover:text-primary"
              />

              <ActionButton
                href={post.fileUrl}
                download={post.fileName}
                onClick={handleDownload}
                icon={<Download className="size-[18px]" />}
                label={`Baixar ${post.fileType}`}
                srLabel={`Baixar ${post.fileName}`}
                hoverClass="group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
              />

              <ActionButton
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  void navigator.share?.({ title: post.title, url: `/artigo/${post.id}` })
                }}
                icon={<Share2 className="size-[18px]" />}
                srLabel="Compartilhar"
                hoverClass="group-hover:bg-primary/10 group-hover:text-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

/** Botao da barra de interacao: icone em circulo + contador ao lado. */
function ActionButton({
  icon,
  label,
  srLabel,
  active,
  onClick,
  href,
  internalHref,
  download,
  disabled,
  activeClass,
  hoverClass,
}: {
  icon: React.ReactNode
  label?: string
  srLabel: string
  active?: boolean
  onClick?: (e: React.MouseEvent) => void
  /** Link externo ou download do arquivo. */
  href?: string
  /** Rota interna — navega pelo router do Next, sem recarregar a pagina. */
  internalHref?: string
  download?: string
  disabled?: boolean
  activeClass?: string
  hoverClass?: string
}) {
  const content = (
    <>
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-full transition-colors',
          hoverClass
        )}
      >
        {icon}
      </span>
      {label && <span className="text-xs font-medium tabular-nums">{label}</span>}
      <span className="sr-only">{srLabel}</span>
    </>
  )

  const classes = cn(
    'group -ml-1.5 flex items-center gap-0.5 text-muted-foreground transition-colors',
    active && activeClass,
    disabled && 'pointer-events-none opacity-60'
  )

  if (internalHref) {
    return (
      <Link href={internalHref} onClick={onClick} className={classes}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} download={download} onClick={onClick} className={classes}>
        {content}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  )
}
