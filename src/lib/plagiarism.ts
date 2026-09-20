// Modulo exclusivo de servidor.
import { prisma } from './prisma'
import {
  hashFile,
  hashContent,
  shingles,
  similarity,
  SIMILARITY_BLOCK_THRESHOLD,
  SIMILARITY_WARN_THRESHOLD,
} from './hash'

// ---------------------------------------------------------------------------
// SISTEMA ANTI-PLAGIO — verificacao no momento do upload.
//
// Ordem das checagens (da mais barata para a mais cara):
//   1. fileHash  — indice UNIQUE, uma query. Pega arquivo identico.
//   2. contentHash — indice comum, uma query. Pega mesmo texto reexportado.
//   3. Shingles  — compara com os candidatos que compartilham tags/area.
//      So roda se 1 e 2 passarem.
//
// A comparacao 3 le Post.content dos candidatos. Em bases grandes, mova esta
// etapa para uma fila (BullMQ/Inngest) ou use pg_trgm / um indice vetorial
// no proprio Postgres em vez de comparar em memoria.
// ---------------------------------------------------------------------------

export type PlagiarismVerdict = 'CLEAN' | 'WARN' | 'BLOCKED'

export interface PlagiarismReport {
  verdict: PlagiarismVerdict
  fileHash: string
  contentHash: string
  /** 0-100 de similaridade com o documento mais parecido encontrado. */
  similarityScore: number
  duplicateOfId: string | null
  /** Mensagem pronta para exibir ao usuario. */
  message: string | null
  /** Divergencia entre o autor do metadado do arquivo e quem esta publicando. */
  authorMismatch: { docAuthor: string; uploader: string } | null
}

interface CheckInput {
  buffer: Buffer
  text: string
  uploaderId: string
  uploaderName: string
  /** Autor lido dos metadados do PDF/DOCX. */
  docAuthor?: string | null
  /** Restringe a comparacao por shingles aos posts com estas tags. */
  tagSlugs?: string[]
}

export async function checkPlagiarism(input: CheckInput): Promise<PlagiarismReport> {
  const fileHash = hashFile(input.buffer)
  const contentHash = hashContent(input.text)

  const base: PlagiarismReport = {
    verdict: 'CLEAN',
    fileHash,
    contentHash,
    similarityScore: 0,
    duplicateOfId: null,
    message: null,
    authorMismatch: checkAuthorMismatch(input.docAuthor, input.uploaderName),
  }

  // --- 1. Arquivo binariamente identico ---
  const sameFile = await prisma.post.findUnique({
    where: { fileHash },
    select: { id: true, title: true, authorId: true, author: { select: { name: true } } },
  })

  if (sameFile) {
    const isSameAuthor = sameFile.authorId === input.uploaderId
    return {
      ...base,
      verdict: 'BLOCKED',
      similarityScore: 100,
      duplicateOfId: sameFile.id,
      message: isSameAuthor
        ? `Você já publicou este arquivo: "${sameFile.title}".`
        : `Este arquivo já foi publicado na plataforma por ${sameFile.author.name} ("${sameFile.title}"). O envio foi bloqueado pelo sistema anti-plágio.`,
    }
  }

  // --- 2. Mesmo texto, arquivo diferente ---
  const sameContent = await prisma.post.findFirst({
    where: { contentHash },
    select: { id: true, title: true, authorId: true, author: { select: { name: true } } },
  })

  if (sameContent) {
    const isSameAuthor = sameContent.authorId === input.uploaderId
    return {
      ...base,
      verdict: 'BLOCKED',
      similarityScore: 100,
      duplicateOfId: sameContent.id,
      message: isSameAuthor
        ? `O conteúdo deste documento é idêntico ao do seu artigo "${sameContent.title}".`
        : `O conteúdo deste documento é idêntico ao artigo "${sameContent.title}", de ${sameContent.author.name}. O envio foi bloqueado pelo sistema anti-plágio.`,
    }
  }

  // --- 3. Similaridade parcial ---
  const candidates = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      content: { not: null },
      ...(input.tagSlugs?.length ? { tags: { some: { slug: { in: input.tagSlugs } } } } : {}),
    },
    select: { id: true, title: true, content: true, author: { select: { name: true } } },
    orderBy: { publishedAt: 'desc' },
    take: 200,
  })

  const mine = shingles(input.text)
  let best = { score: 0, id: null as string | null, title: '', author: '' }

  for (const candidate of candidates) {
    const score = similarity(mine, shingles(candidate.content!))
    if (score > best.score) {
      best = { score, id: candidate.id, title: candidate.title, author: candidate.author.name }
    }
  }

  if (best.score >= SIMILARITY_BLOCK_THRESHOLD) {
    return {
      ...base,
      verdict: 'BLOCKED',
      similarityScore: best.score,
      duplicateOfId: best.id,
      message: `Este documento tem ${best.score.toFixed(1)}% de similaridade com "${best.title}", de ${best.author}. O envio foi bloqueado pelo sistema anti-plágio.`,
    }
  }

  if (best.score >= SIMILARITY_WARN_THRESHOLD) {
    return {
      ...base,
      verdict: 'WARN',
      similarityScore: best.score,
      duplicateOfId: best.id,
      message: `Detectamos ${best.score.toFixed(1)}% de similaridade com "${best.title}". Se for continuação ou versão revisada do seu próprio trabalho, cite-o explicitamente.`,
    }
  }

  return { ...base, similarityScore: best.score }
}

/**
 * O campo "Author" do PDF vindo de outra pessoa e o indicio mais comum de
 * documento reenviado. Nao bloqueia — sinaliza para revisao.
 */
function checkAuthorMismatch(
  docAuthor: string | null | undefined,
  uploaderName: string
): PlagiarismReport['authorMismatch'] {
  if (!docAuthor) return null

  const normalize = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').trim()

  const docTokens = new Set(normalize(docAuthor).split(/\s+/).filter((t) => t.length > 2))
  const userTokens = normalize(uploaderName).split(/\s+/).filter((t) => t.length > 2)

  // Se nenhum sobrenome/nome bate, e divergencia.
  const overlap = userTokens.some((t) => docTokens.has(t))
  return overlap ? null : { docAuthor, uploader: uploaderName }
}
