import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <FileQuestion className="size-12 text-muted-foreground" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Página não encontrada</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          O artigo ou a página que você procura não existe ou foi removida.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Voltar ao feed</Link>
      </Button>
    </div>
  )
}
