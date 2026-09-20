// Modulo exclusivo de servidor: nunca importe em um Client Component.
// ---------------------------------------------------------------------------
// EXTRACAO DE TEXTO E METADADOS de PDF e DOCX.
//
// Usado em dois pontos:
//   - Criar o post: titulo e abstract saem do proprio arquivo, o pesquisador
//     so confere (requisito "extracao automatica").
//   - Anti-plagio: os metadados originais (autor, data de criacao, produtor)
//     sao guardados como prova e comparados com quem esta publicando.
//
// `pdf-parse` e `mammoth` sao Node puro — por isso estao em
// `serverExternalPackages` no next.config.mjs.
// ---------------------------------------------------------------------------

export interface ExtractedDocument {
  /** Texto integral, usado na leitura inline e no anti-plagio. */
  text: string
  /** Titulo inferido (metadado do arquivo ou primeira linha relevante). */
  title: string | null
  /** Abstract/resumo inferido. */
  abstract: string | null
  pageCount: number | null
  /** Metadados crus do documento — vao para Post.metadata (Json). */
  metadata: {
    author?: string | null
    title?: string | null
    subject?: string | null
    keywords?: string | null
    creator?: string | null
    producer?: string | null
    createdAt?: Date | null
    modifiedAt?: Date | null
  }
}

/** Le um PDF: texto + metadados do dicionario Info. */
async function extractPdf(buffer: Buffer): Promise<ExtractedDocument> {
  // Import do arquivo interno: o index.js do pdf-parse roda um teste com um
  // PDF de exemplo quando importado direto, o que quebra o build.
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
  const data = await pdfParse(buffer)
  const info = (data.info ?? {}) as Record<string, unknown>

  return {
    text: data.text ?? '',
    title: cleanString(info.Title as string) ?? inferTitle(data.text ?? ''),
    abstract: inferAbstract(data.text ?? ''),
    pageCount: data.numpages ?? null,
    metadata: {
      author: cleanString(info.Author as string),
      title: cleanString(info.Title as string),
      subject: cleanString(info.Subject as string),
      keywords: cleanString(info.Keywords as string),
      creator: cleanString(info.Creator as string),
      producer: cleanString(info.Producer as string),
      createdAt: parsePdfDate(info.CreationDate as string),
      modifiedAt: parsePdfDate(info.ModDate as string),
    },
  }
}

/** Le um DOCX via mammoth (texto limpo, sem markup). */
async function extractDocx(buffer: Buffer): Promise<ExtractedDocument> {
  const mammoth = await import('mammoth')
  const { value: text } = await mammoth.extractRawText({ buffer })

  return {
    text,
    title: inferTitle(text),
    abstract: inferAbstract(text),
    pageCount: null,
    // Os metadados do core.xml do DOCX exigem descompactar o pacote OOXML.
    // Se voce precisar deles, leia `docProps/core.xml` com uma lib de zip
    // (ex.: `unzipper` ou `jszip`) e preencha este objeto.
    metadata: {},
  }
}

/** Ponto de entrada: decide o parser pelo tipo do arquivo. */
export async function extractDocument(
  buffer: Buffer,
  fileName: string
): Promise<ExtractedDocument> {
  const ext = fileName.toLowerCase().split('.').pop()
  if (ext === 'pdf') return extractPdf(buffer)
  if (ext === 'docx') return extractDocx(buffer)
  throw new Error(`Formato não suportado: .${ext}. Envie um arquivo .pdf ou .docx.`)
}

// -------------------------------- helpers ---------------------------------

function cleanString(value?: string | null): string | null {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Sem metadado de titulo, pegamos a primeira linha "com cara de titulo":
 * entre 15 e 250 caracteres, nao e cabecalho de revista nem numero de pagina.
 */
function inferTitle(text: string): string | null {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  for (const line of lines.slice(0, 15)) {
    if (line.length < 15 || line.length > 250) continue
    if (/^(issn|doi|revista|vol\.|p\.|página|page|\d+$)/i.test(line)) continue
    return line.replace(/\s+/g, ' ')
  }
  return lines[0]?.slice(0, 250) ?? null
}

/**
 * Procura o bloco apos "Resumo"/"Abstract". Se nao achar o marcador,
 * usa os primeiros paragrafos como previa do feed.
 */
function inferAbstract(text: string): string | null {
  const match = text.match(
    /(?:^|\n)\s*(?:resumo|abstract|sumário executivo|synopsis)\s*[:.\-—]?\s*\n?([\s\S]{80,2500}?)(?:\n\s*(?:palavras[- ]chave|keywords|abstract|resumo|1\s|introdu[çc][ãa]o)\b|\n\s*\n)/i
  )
  if (match?.[1]) return match[1].replace(/\s+/g, ' ').trim()

  const body = text.replace(/\s+/g, ' ').trim()
  return body.length > 120 ? body.slice(0, 900) + '…' : body || null
}

/** Datas de PDF vem como "D:20240315142530-03'00'". */
function parsePdfDate(value?: string | null): Date | null {
  if (!value || typeof value !== 'string') return null
  const m = value.match(/D:(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/)
  if (!m) {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const [, y, mo, d, h = '00', mi = '00', s = '00'] = m
  const date = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`)
  return Number.isNaN(date.getTime()) ? null : date
}
