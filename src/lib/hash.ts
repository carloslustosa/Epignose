import { createHash } from 'node:crypto'

// ---------------------------------------------------------------------------
// SISTEMA ANTI-PLAGIO — camada de impressao digital dos documentos.
//
// Trabalhamos com duas assinaturas por arquivo:
//
//   1. fileHash    — SHA-256 do binario. Pega o reupload do arquivo IDENTICO.
//                    E UNIQUE no banco (Post.fileHash), entao o Postgres ja
//                    rejeita duplicata mesmo em corrida entre duas contas.
//
//   2. contentHash — SHA-256 do TEXTO normalizado. Pega o mesmo conteudo salvo
//                    de novo (PDF -> DOCX, reexportado, com metadados trocados),
//                    casos em que o binario muda mas o texto nao.
//
// Para similaridade parcial (trechos copiados) usamos shingles + Jaccard,
// que roda em memoria e nao exige servico externo. Para uma verificacao
// forte contra a web, plugue aqui um provedor (Copyleaks, Turnitin, PlagScan).
// ---------------------------------------------------------------------------

/** SHA-256 do binario do arquivo. */
export function hashFile(buffer: Buffer | Uint8Array): string {
  return createHash('sha256').update(buffer).digest('hex')
}

/**
 * Normaliza o texto antes de assinar: sem acentos, sem pontuacao, sem
 * variacao de espaco e em minusculas. Assim "Art. 5º, §1º" e "art 5o 1o"
 * geram a mesma assinatura.
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** SHA-256 do texto normalizado. */
export function hashContent(text: string): string {
  return createHash('sha256').update(normalizeText(text)).digest('hex')
}

/**
 * Shingles de `size` palavras. Um documento vira um conjunto de assinaturas
 * curtas; documentos parecidos compartilham muitos shingles.
 */
export function shingles(text: string, size = 8): Set<string> {
  const words = normalizeText(text).split(' ')
  const out = new Set<string>()
  for (let i = 0; i + size <= words.length; i++) {
    out.add(createHash('sha1').update(words.slice(i, i + size).join(' ')).digest('hex').slice(0, 16))
  }
  return out
}

/** Indice de Jaccard entre dois conjuntos de shingles -> 0 a 100 (%). */
export function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const s of a) if (b.has(s)) intersection++
  const union = a.size + b.size - intersection
  return Math.round((intersection / union) * 10000) / 100
}

/** Compara dois textos direto. */
export function textSimilarity(a: string, b: string): number {
  return similarity(shingles(a), shingles(b))
}

/** Acima disso o upload e bloqueado; entre 35 e 85 vai para revisao manual. */
export const SIMILARITY_BLOCK_THRESHOLD = 85
export const SIMILARITY_WARN_THRESHOLD = 35
