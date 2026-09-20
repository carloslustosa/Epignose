'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { features } from '@/lib/env'
import { requireUser } from '@/lib/auth'
import { extractDocument } from '@/lib/extract'
import { checkPlagiarism } from '@/lib/plagiarism'
import { uploadArticleFile } from '@/lib/storage'
import { slugify } from '@/lib/utils'
import type { FileType } from '@/types'

// ---------------------------------------------------------------------------
// PUBLICACAO DE ARTIGO — fluxo completo do upload.
//
//   1. valida arquivo (tipo e tamanho)
//   2. EXTRAI texto e metadados do PDF/DOCX
//   3. roda o ANTI-PLAGIO (hash + similaridade). Bloqueia se for duplicata.
//   4. sobe o arquivo para o Storage
//   5. grava o Post com os metadados originais do documento
//
// O limite de corpo das Server Actions esta em next.config.mjs (25mb).
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB
const ACCEPTED = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
} as const

const schema = z.object({
  title: z.string().min(10, 'O título precisa de pelo menos 10 caracteres.').max(300),
  abstract: z.string().min(80, 'O resumo precisa de pelo menos 80 caracteres.').max(4000),
  tags: z.array(z.string()).min(1, 'Informe ao menos uma área de pesquisa.').max(6),
  doi: z.string().optional(),
})

export interface PublishState {
  ok: boolean
  error?: string
  /** Aviso nao bloqueante (ex.: similaridade moderada, autor divergente). */
  warning?: string
  postId?: string
}

/** Passo 1 da UI: le o arquivo e devolve titulo/resumo sugeridos. */
export async function analisarArquivo(formData: FormData) {
  const file = formData.get('file')
  if (!(file instanceof File)) return { ok: false as const, error: 'Nenhum arquivo enviado.' }

  const validation = validateFile(file)
  if (validation) return { ok: false as const, error: validation }

  const buffer = Buffer.from(await file.arrayBuffer())
  const extracted = await extractDocument(buffer, file.name)

  return {
    ok: true as const,
    title: extracted.title ?? '',
    abstract: extracted.abstract ?? '',
    pageCount: extracted.pageCount,
    docAuthor: extracted.metadata.author ?? null,
    docCreatedAt: extracted.metadata.createdAt?.toISOString() ?? null,
  }
}

/** Passo 2: publica de fato. */
export async function publicarArtigo(
  _prev: PublishState | null,
  formData: FormData
): Promise<PublishState> {
  if (!features.database || !features.storage) {
    return {
      ok: false,
      error:
        'Publicação indisponível no modo demonstração. Configure DATABASE_URL e as chaves do Storage no arquivo .env.',
    }
  }

  const user = await requireUser()

  const file = formData.get('file')
  if (!(file instanceof File)) return { ok: false, error: 'Nenhum arquivo enviado.' }

  const fileError = validateFile(file)
  if (fileError) return { ok: false, error: fileError }

  const parsed = schema.safeParse({
    title: formData.get('title'),
    abstract: formData.get('abstract'),
    tags: formData.getAll('tags').map(String).filter(Boolean),
    doi: formData.get('doi') || undefined,
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const { title, abstract, tags, doi } = parsed.data
  const buffer = Buffer.from(await file.arrayBuffer())

  // ---- 2. Extracao ----
  const extracted = await extractDocument(buffer, file.name)

  // ---- 3. Anti-plagio ----
  const report = await checkPlagiarism({
    buffer,
    text: extracted.text,
    uploaderId: user.id,
    uploaderName: user.name,
    docAuthor: extracted.metadata.author,
    tagSlugs: tags.map(slugify),
  })

  if (report.verdict === 'BLOCKED') {
    return { ok: false, error: report.message ?? 'Documento duplicado.' }
  }

  // ---- 4. Storage ----
  const uploaded = await uploadArticleFile(buffer, file.name, user.id, file.type)

  // ---- 5. Persistencia ----
  try {
    const post = await prisma.post.create({
      data: {
        title,
        abstract,
        content: extracted.text,
        fileUrl: uploaded.url,
        fileKey: uploaded.key,
        fileName: file.name,
        fileType: ACCEPTED[file.type as keyof typeof ACCEPTED] as FileType,
        fileSize: file.size,
        pageCount: extracted.pageCount,

        // Anti-plagio
        fileHash: report.fileHash,
        contentHash: report.contentHash,
        similarityScore: report.similarityScore,
        duplicateOfId: report.duplicateOfId,

        // Metadados originais do documento
        docAuthor: extracted.metadata.author,
        docTitle: extracted.metadata.title,
        docProducer: extracted.metadata.producer,
        docCreatedAt: extracted.metadata.createdAt,
        docModifiedAt: extracted.metadata.modifiedAt,
        metadata: extracted.metadata as object,

        doi: doi || null,
        authorId: user.id,

        tags: {
          connectOrCreate: tags.map((label) => ({
            where: { slug: slugify(label) },
            create: { slug: slugify(label), label },
          })),
        },
      },
      select: { id: true },
    })

    revalidatePath('/')

    const warnings = [
      report.verdict === 'WARN' ? report.message : null,
      report.authorMismatch
        ? `O documento indica "${report.authorMismatch.docAuthor}" como autor nos metadados, diferente do seu perfil. A publicação ficará sinalizada para revisão.`
        : null,
    ].filter(Boolean)

    return { ok: true, postId: post.id, warning: warnings.join(' ') || undefined }
  } catch (error) {
    // Se o insert falhar depois do upload, removemos o arquivo orfao.
    const { deleteArticleFile } = await import('@/lib/storage')
    await deleteArticleFile(uploaded.key).catch(() => {})

    console.error('[publicarArtigo]', error)
    return { ok: false, error: 'Não foi possível publicar o artigo. Tente novamente.' }
  }
}

/** Curtir / descurtir (toggle). */
export async function alternarCurtida(postId: string) {
  if (!features.database) return { ok: false, error: 'Indisponível no modo demonstração.' }

  const user = await requireUser()
  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  })

  if (existing) await prisma.like.delete({ where: { id: existing.id } })
  else await prisma.like.create({ data: { postId, userId: user.id } })

  revalidatePath('/')
  revalidatePath(`/artigo/${postId}`)
  return { ok: true, liked: !existing }
}

/** Contador do botao "Baixar". */
export async function registrarDownload(postId: string) {
  if (!features.database) return { ok: true }
  await prisma.post.update({ where: { id: postId }, data: { downloadCount: { increment: 1 } } })
  return { ok: true }
}

// -------------------------------- helpers ---------------------------------

function validateFile(file: File): string | null {
  if (!(file.type in ACCEPTED)) return 'Formato inválido. Envie um arquivo .pdf ou .docx.'
  if (file.size > MAX_FILE_SIZE) return 'Arquivo muito grande. O limite é 25 MB.'
  if (file.size === 0) return 'O arquivo está vazio.'
  return null
}
