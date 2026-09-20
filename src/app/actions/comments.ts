'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { features } from '@/lib/env'
import { requireUser } from '@/lib/auth'

// ---------------------------------------------------------------------------
// PEER REVIEW — comentarios em thread e avaliacao por estrelas.
// ---------------------------------------------------------------------------

const commentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().min(10, 'Escreva ao menos 10 caracteres.').max(8000),
  kind: z.enum(['COMMENT', 'CONSTRUCTIVE', 'METHODOLOGY', 'REFERENCE_REQUEST']).default('COMMENT'),
  parentId: z.string().optional(),
  /** Trecho do artigo ao qual a critica se refere. */
  quotedText: z.string().max(2000).optional(),
  pageNumber: z.coerce.number().int().positive().optional(),
})

export interface CommentState {
  ok: boolean
  error?: string
}

export async function comentarArtigo(
  _prev: CommentState | null,
  formData: FormData
): Promise<CommentState> {
  if (!features.database) {
    return { ok: false, error: 'Comentários indisponíveis no modo demonstração. Configure DATABASE_URL.' }
  }

  const parsed = commentSchema.safeParse({
    postId: formData.get('postId'),
    body: formData.get('body'),
    kind: formData.get('kind') ?? 'COMMENT',
    parentId: formData.get('parentId') || undefined,
    quotedText: formData.get('quotedText') || undefined,
    pageNumber: formData.get('pageNumber') || undefined,
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const user = await requireUser()

  await prisma.comment.create({
    data: { ...parsed.data, authorId: user.id },
  })

  revalidatePath(`/artigo/${parsed.data.postId}`)
  return { ok: true }
}

const ratingSchema = z.object({
  postId: z.string().min(1),
  score: z.coerce.number().int().min(1).max(5),
  rigor: z.coerce.number().int().min(1).max(5).optional(),
  originality: z.coerce.number().int().min(1).max(5).optional(),
  clarity: z.coerce.number().int().min(1).max(5).optional(),
  review: z.string().max(8000).optional(),
})

/** Avaliacao por estrelas — um registro por (post, usuario). */
export async function avaliarArtigo(formData: FormData): Promise<CommentState> {
  if (!features.database) {
    return { ok: false, error: 'Avaliação indisponível no modo demonstração.' }
  }

  const parsed = ratingSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const user = await requireUser()
  const { postId, ...data } = parsed.data

  await prisma.rating.upsert({
    where: { postId_userId: { postId, userId: user.id } },
    create: { postId, userId: user.id, ...data },
    update: data,
  })

  revalidatePath(`/artigo/${postId}`)
  return { ok: true }
}

/** O autor marca uma critica como endereçada. */
export async function resolverCritica(commentId: string, postId: string) {
  if (!features.database) return { ok: false, error: 'Indisponível no modo demonstração.' }

  await requireUser()
  await prisma.comment.update({ where: { id: commentId }, data: { isResolved: true } })
  revalidatePath(`/artigo/${postId}`)
  return { ok: true }
}
