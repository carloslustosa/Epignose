// O pacote @types/pdf-parse so declara o entrypoint principal. Importamos o
// arquivo interno (src/lib/extract.ts) porque o index.js do pdf-parse executa
// um teste com PDF de exemplo ao ser importado, o que quebra o build.
declare module 'pdf-parse/lib/pdf-parse.js' {
  import type { Buffer } from 'node:buffer'

  interface PdfParseResult {
    numpages: number
    numrender: number
    info: Record<string, unknown>
    metadata: unknown
    version: string
    text: string
  }

  function pdfParse(dataBuffer: Buffer, options?: Record<string, unknown>): Promise<PdfParseResult>

  export default pdfParse
}
