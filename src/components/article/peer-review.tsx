'use client'

import * as React from 'react'
import { useActionState } from 'react'
import {
  MessageSquareQuote,
  ArrowBigUp,
  CornerDownRight,
  CheckCircle2,
  Loader2,
  Star,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { StarRating } from '@/components/ui/star-rating'
import { cn, initials, timeAgo } from '@/lib/utils'
import { comentarArtigo, avaliarArtigo, type CommentState } from '@/app/actions/comments'
import { COMMENT_KIND_LABEL, type CommentKind, type PeerComment, type Author } from '@/types'

// ---------------------------------------------------------------------------
// PEER REVIEW ABERTO
//
// Duas frentes, em abas:
//   - Discussão: comentarios em thread, tipados (critica construtiva,
//     apontamento metodologico, pedido de referencia), com citacao de trecho.
//   - Avaliação: estrelas por criterio academico (rigor, originalidade, clareza).
// ---------------------------------------------------------------------------

const KIND_STYLE: Record<CommentKind, string> = {
  COMMENT: 'secondary',
  CONSTRUCTIVE: 'default',
  METHODOLOGY: 'warning',
  REFERENCE_REQUEST: 'success',
}

export function PeerReview({
  postId,
  comments,
  currentUser,
}: {
  postId: string
  comments: PeerComment[]
  currentUser: Author
}) {
  const total = countComments(comments)

  return (
    <section id="revisao" className="scroll-mt-16 px-4 py-6 sm:px-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight">
        <MessageSquareQuote className="size-5 text-primary" />
        Revisão por pares
        <span className="text-sm font-normal text-muted-foreground">({total})</span>
      </h2>

      <Tabs defaultValue="discussao">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="discussao" className="flex-1 sm:flex-none">
            Discussão
          </TabsTrigger>
          <TabsTrigger value="avaliacao" className="flex-1 sm:flex-none">
            Avaliar artigo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussao" className="space-y-5">
          <CommentForm postId={postId} currentUser={currentUser} />

          <div className="space-y-5">
            {comments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma crítica ainda. Seja o primeiro a revisar este trabalho.
              </p>
            ) : (
              comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  postId={postId}
                  currentUser={currentUser}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="avaliacao">
          <RatingForm postId={postId} />
        </TabsContent>
      </Tabs>
    </section>
  )
}

// ------------------------------ Formulario ---------------------------------

function CommentForm({
  postId,
  currentUser,
  parentId,
  quotedText,
  onDone,
}: {
  postId: string
  currentUser: Author
  parentId?: string
  quotedText?: string
  onDone?: () => void
}) {
  const [state, formAction, isPending] = useActionState<CommentState | null, FormData>(
    comentarArtigo,
    null
  )
  const [kind, setKind] = React.useState<CommentKind>(parentId ? 'COMMENT' : 'CONSTRUCTIVE')
  const [body, setBody] = React.useState('')

  React.useEffect(() => {
    if (state?.ok) {
      setBody('')
      onDone?.()
    }
  }, [state, onDone])

  return (
    <form action={formAction} className="flex gap-3">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="kind" value={kind} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      {quotedText && <input type="hidden" name="quotedText" value={quotedText} />}

      <Avatar className="size-9 shrink-0">
        {currentUser.avatarUrl ? (
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
        ) : null}
        <AvatarFallback>{initials(currentUser.name)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-2.5">
        {!parentId && (
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(COMMENT_KIND_LABEL) as CommentKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  kind === k
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:bg-accent'
                )}
              >
                {COMMENT_KIND_LABEL[k]}
              </button>
            ))}
          </div>
        )}

        <Textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={10}
          maxLength={8000}
          rows={parentId ? 2 : 3}
          placeholder={
            parentId
              ? 'Responder…'
              : 'Aponte um problema metodológico, sugira uma referência, questione uma conclusão. Críticas específicas ajudam mais que elogios genéricos.'
          }
          className="resize-none"
        />

        {state && !state.ok && state.error && (
          <p className="text-xs text-destructive">{state.error}</p>
        )}

        <div className="flex items-center justify-end gap-2">
          {onDone && (
            <Button type="button" variant="ghost" size="sm" onClick={onDone}>
              Cancelar
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isPending || body.trim().length < 10}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {parentId ? 'Responder' : 'Publicar crítica'}
          </Button>
        </div>
      </div>
    </form>
  )
}

// -------------------------------- Thread -----------------------------------

function CommentThread({
  comment,
  postId,
  currentUser,
  depth = 0,
}: {
  comment: PeerComment
  postId: string
  currentUser: Author
  depth?: number
}) {
  const [replying, setReplying] = React.useState(false)

  return (
    <div className={cn(depth > 0 && 'ml-5 border-l border-border pl-4 sm:ml-8 sm:pl-5')}>
      <div className="flex gap-3">
        <Avatar className="size-9 shrink-0">
          {comment.author.avatarUrl ? (
            <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
          ) : null}
          <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-semibold">{comment.author.name}</span>
            <span className="text-muted-foreground">@{comment.author.handle}</span>
            <span className="text-muted-foreground">·</span>
            <time className="text-muted-foreground" dateTime={comment.createdAt}>
              {timeAgo(comment.createdAt)}
            </time>
            {comment.kind !== 'COMMENT' && (
              <Badge variant={KIND_STYLE[comment.kind] as 'default'}>
                {COMMENT_KIND_LABEL[comment.kind]}
              </Badge>
            )}
            {comment.isResolved && (
              <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                Endereçada
              </span>
            )}
          </div>

          {comment.author.institution && (
            <p className="text-xs text-muted-foreground">{comment.author.institution}</p>
          )}

          {/* Trecho do artigo ao qual a critica se refere */}
          {comment.quotedText && (
            <blockquote className="my-2 border-l-2 border-amber-400 bg-amber-500/5 py-1.5 pl-3 text-sm italic text-muted-foreground">
              “{comment.quotedText}”
              {comment.pageNumber && (
                <span className="ml-1 not-italic">(p. {comment.pageNumber})</span>
              )}
            </blockquote>
          )}

          <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
            {comment.body}
          </p>

          <div className="mt-2 flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
              <ArrowBigUp className="size-4" />
              {comment.upvotes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={() => setReplying((v) => !v)}
            >
              <CornerDownRight className="size-4" />
              Responder
            </Button>
          </div>

          {replying && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                currentUser={currentUser}
                parentId={comment.id}
                onDone={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUser={currentUser}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ------------------------------- Avaliacao ---------------------------------

const CRITERIA = [
  { name: 'rigor', label: 'Rigor metodológico', hint: 'Adequação do método à pergunta de pesquisa' },
  { name: 'originality', label: 'Originalidade', hint: 'Contribuição nova ao campo' },
  { name: 'clarity', label: 'Clareza', hint: 'Organização e legibilidade do texto' },
] as const

function RatingForm({ postId }: { postId: string }) {
  const [scores, setScores] = React.useState<Record<string, number>>({})
  const [overall, setOverall] = React.useState(0)
  const [pending, startTransition] = React.useTransition()
  const [message, setMessage] = React.useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    formData.set('postId', postId)
    formData.set('score', String(overall))
    for (const [key, value] of Object.entries(scores)) formData.set(key, String(value))

    startTransition(async () => {
      const res = await avaliarArtigo(formData)
      setMessage(res.ok ? 'Avaliação registrada. Obrigado pela revisão.' : (res.error ?? null))
    })
  }

  return (
    <Card className="p-5">
      <form action={handleSubmit} className="space-y-5">
        <div>
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Star className="size-4 text-amber-400" />
            Avaliação geral
          </p>
          <p className="mb-2 text-xs text-muted-foreground">
            Sua nota entra na média exibida no card do artigo.
          </p>
          <StarRating value={overall} onChange={setOverall} size="lg" />
        </div>

        <div className="space-y-3">
          {CRITERIA.map((criterion) => (
            <div key={criterion.name} className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{criterion.label}</p>
                <p className="text-xs text-muted-foreground">{criterion.hint}</p>
              </div>
              <StarRating
                value={scores[criterion.name] ?? 0}
                onChange={(v) => setScores((s) => ({ ...s, [criterion.name]: v }))}
                size="sm"
              />
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="review" className="mb-1.5 block text-sm font-medium">
            Parecer (opcional)
          </label>
          <Textarea
            id="review"
            name="review"
            rows={4}
            maxLength={8000}
            placeholder="Justifique sua avaliação. O parecer fica visível para o autor e para os demais revisores."
          />
        </div>

        {message && (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        )}

        <Button type="submit" disabled={pending || overall === 0}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Enviar avaliação
        </Button>
      </form>
    </Card>
  )
}

function countComments(comments: PeerComment[]): number {
  return comments.reduce((total, c) => total + 1 + countComments(c.replies), 0)
}
