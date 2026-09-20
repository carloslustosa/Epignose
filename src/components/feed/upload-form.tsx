'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import {
  FileUp,
  FileText,
  Loader2,
  X,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn, formatBytes } from '@/lib/utils'
import { analisarArquivo, publicarArtigo, type PublishState } from '@/app/actions/posts'

// ---------------------------------------------------------------------------
// FORMULARIO DE PUBLICACAO — dois passos.
//
//   Passo 1: o usuario anexa o .pdf/.docx. A Server Action `analisarArquivo`
//            extrai titulo, resumo, paginas e o autor dos metadados.
//   Passo 2: o usuario confere/edita, adiciona as tags e publica. Ai roda o
//            anti-plagio (hash + similaridade) antes de gravar.
// ---------------------------------------------------------------------------

const ACCEPT = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

interface Extracted {
  title: string
  abstract: string
  pageCount: number | null
  docAuthor: string | null
  docCreatedAt: string | null
}

export function UploadForm() {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [file, setFile] = React.useState<File | null>(null)
  const [extracted, setExtracted] = React.useState<Extracted | null>(null)
  const [analyzing, setAnalyzing] = React.useState(false)
  const [analyzeError, setAnalyzeError] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [tags, setTags] = React.useState<string[]>([])
  const [tagInput, setTagInput] = React.useState('')

  const [state, formAction, publishing] = useActionState<PublishState | null, FormData>(
    publicarArtigo,
    null
  )

  React.useEffect(() => {
    if (state?.ok && state.postId) router.push(`/artigo/${state.postId}`)
  }, [state, router])

  async function handleFile(selected: File) {
    setFile(selected)
    setExtracted(null)
    setAnalyzeError(null)
    setAnalyzing(true)

    const formData = new FormData()
    formData.append('file', selected)

    const result = await analisarArquivo(formData)
    setAnalyzing(false)

    if (!result.ok) {
      setAnalyzeError(result.error)
      return
    }
    setExtracted({
      title: result.title,
      abstract: result.abstract,
      pageCount: result.pageCount,
      docAuthor: result.docAuthor,
      docCreatedAt: result.docCreatedAt,
    })
  }

  function addTag() {
    const value = tagInput.trim()
    if (!value || tags.includes(value) || tags.length >= 6) return
    setTags((t) => [...t, value])
    setTagInput('')
  }

  function reset() {
    setFile(null)
    setExtracted(null)
    setAnalyzeError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* ------------------------- Passo 1: o arquivo ------------------------- */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const dropped = e.dataTransfer.files?.[0]
          if (dropped) {
            // Mantemos o input em sincronia para que o arquivo viaje no submit.
            const transfer = new DataTransfer()
            transfer.items.add(dropped)
            if (inputRef.current) inputRef.current.files = transfer.files
            void handleFile(dropped)
          }
        }}
        className={cn(
          'rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          dragging ? 'border-primary bg-primary/5' : 'border-border',
          file && 'border-solid p-4 text-left'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept={ACCEPT}
          required
          className="sr-only"
          onChange={(e) => {
            const selected = e.target.files?.[0]
            if (selected) void handleFile(selected)
          }}
        />

        {!file ? (
          <>
            <FileUp className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-[15px] font-medium">
              Arraste seu artigo aqui ou{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-primary underline underline-offset-4"
              >
                escolha um arquivo
              </button>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              PDF ou DOCX, até 25 MB. O título e o resumo são extraídos automaticamente.
            </p>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
                {extracted?.pageCount ? ` · ${extracted.pageCount} páginas` : ''}
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" onClick={reset} aria-label="Remover arquivo">
              <X />
            </Button>
          </div>
        )}
      </div>

      {analyzing && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Lendo o documento e extraindo título, resumo e metadados…
        </p>
      )}

      {analyzeError && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {analyzeError}
        </Card>
      )}

      {/* --------------------- Passo 2: conferir e publicar -------------------- */}
      {extracted && (
        <div className="animate-fade-in space-y-5">
          <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
            <Sparkles className="size-4" />
            Extraímos os dados abaixo do seu arquivo. Confira antes de publicar.
          </p>

          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              defaultValue={extracted.title}
              required
              minLength={10}
              maxLength={300}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="abstract">Resumo</Label>
            <p className="mb-1.5 text-xs text-muted-foreground">
              É o texto que aparece no card do feed.
            </p>
            <Textarea
              id="abstract"
              name="abstract"
              defaultValue={extracted.abstract}
              required
              minLength={80}
              maxLength={4000}
              rows={6}
            />
          </div>

          {/* Tags da area de pesquisa */}
          <div>
            <Label htmlFor="tagInput">Áreas de pesquisa</Label>
            <p className="mb-1.5 text-xs text-muted-foreground">
              Até 6. Pressione Enter para adicionar.
            </p>
            <div className="flex gap-2">
              <Input
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Ex.: Direito Processual"
                maxLength={60}
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={tags.length >= 6}>
                Adicionar
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1">
                    <Badge variant="default">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags((t) => t.filter((x) => x !== tag))}
                        className="ml-1 opacity-60 hover:opacity-100"
                        aria-label={`Remover ${tag}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                    <input type="hidden" name="tags" value={tag} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="doi">DOI (opcional)</Label>
            <Input id="doi" name="doi" placeholder="10.1234/exemplo.2026.001" className="mt-1.5" />
          </div>

          {/* Painel do anti-plagio */}
          <Card className="space-y-2.5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              Verificação de originalidade
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-px size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                Geramos um hash SHA-256 do arquivo para impedir republicação do mesmo documento.
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-px size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                Comparamos o texto com os artigos já publicados na plataforma.
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-px size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                Guardamos os metadados originais do documento como prova de autoria.
              </li>
            </ul>

            {/* Divergencia entre o autor do metadado e quem publica */}
            {extracted.docAuthor && (
              <p className="flex items-start gap-1.5 rounded-lg bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="mt-px size-3.5 shrink-0" />
                Os metadados do arquivo indicam <strong>{extracted.docAuthor}</strong> como autor
                {extracted.docCreatedAt &&
                  `, criado em ${new Date(extracted.docCreatedAt).toLocaleDateString('pt-BR')}`}
                . Se não for você, confirme que tem autorização para publicar.
              </p>
            )}
          </Card>

          {state && !state.ok && state.error && (
            <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {state.error}
            </Card>
          )}
          {state?.warning && (
            <Card className="border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
              {state.warning}
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={reset}>
              Cancelar
            </Button>
            <Button type="submit" disabled={publishing || tags.length === 0}>
              {publishing && <Loader2 className="size-4 animate-spin" />}
              Publicar artigo
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
