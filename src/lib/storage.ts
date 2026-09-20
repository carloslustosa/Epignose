// Modulo exclusivo de servidor: nunca importe em um Client Component.
import { createClient } from '@supabase/supabase-js'
import { env } from './env'

// ---------------------------------------------------------------------------
// STORAGE DOS ARQUIVOS (PDF / DOCX)
//
// Implementacao padrao: Supabase Storage. Trocar por S3 exige mexer apenas
// nas tres funcoes exportadas aqui — veja o bloco comentado no fim do arquivo.
//
// >>> COMO CONFIGURAR O SUPABASE <<<
//   1. Crie um projeto em https://supabase.com
//   2. Storage > New bucket > nome: "artigos" > marque "Public bucket"
//      (se preferir privado, use `createSignedDownloadUrl` abaixo no lugar da
//       URL publica e mantenha o bucket fechado).
//   3. Settings > API, copie para o `.env`:
//        NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
//        NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
//        SUPABASE_SERVICE_ROLE_KEY="eyJ..."   <- SO no servidor!
//        SUPABASE_STORAGE_BUCKET="artigos"
//
// A service_role key ignora as políticas de RLS. Ela NUNCA pode ir para o
// cliente — por isso o nome nao tem o prefixo NEXT_PUBLIC_.
// ---------------------------------------------------------------------------

const BUCKET = env.SUPABASE_STORAGE_BUCKET

function getClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Storage não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env'
    )
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}

export interface UploadResult {
  /** URL que vai no botao "Baixar PDF" do card. */
  url: string
  /** Chave interna no bucket — guarde em Post.fileKey para poder deletar. */
  key: string
}

/**
 * Sobe o arquivo e devolve URL publica + chave.
 * A chave inclui o id do autor e um timestamp para nunca colidir.
 */
export async function uploadArticleFile(
  buffer: Buffer,
  fileName: string,
  userId: string,
  contentType: string
): Promise<UploadResult> {
  const supabase = getClient()
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const key = `${userId}/${Date.now()}-${safeName}`

  const { error } = await supabase.storage.from(BUCKET).upload(key, buffer, {
    contentType,
    upsert: false,
    cacheControl: '31536000',
  })
  if (error) throw new Error(`Falha no upload: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key)
  return { url: data.publicUrl, key }
}

/** Para bucket privado: link temporario de download. */
export async function createSignedDownloadUrl(key: string, expiresInSeconds = 3600) {
  const supabase = getClient()
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(key, expiresInSeconds)
  if (error) throw new Error(`Falha ao gerar link: ${error.message}`)
  return data.signedUrl
}

/** Remove o arquivo (chamado quando o post e excluido ou o upload e revertido). */
export async function deleteArticleFile(key: string) {
  const supabase = getClient()
  const { error } = await supabase.storage.from(BUCKET).remove([key])
  if (error) throw new Error(`Falha ao remover arquivo: ${error.message}`)
}

// ---------------------------------------------------------------------------
// ALTERNATIVA: AWS S3
// ---------------------------------------------------------------------------
// 1. npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
// 2. .env:
//      AWS_REGION="us-east-1"
//      AWS_ACCESS_KEY_ID="AKIA..."
//      AWS_SECRET_ACCESS_KEY="..."
//      AWS_S3_BUCKET="epignose-artigos"
// 3. Substitua uploadArticleFile por:
//
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
// const s3 = new S3Client({ region: env.AWS_REGION })
// await s3.send(new PutObjectCommand({
//   Bucket: env.AWS_S3_BUCKET, Key: key, Body: buffer, ContentType: contentType,
// }))
// return { url: `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`, key }
// ---------------------------------------------------------------------------
