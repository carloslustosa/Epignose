'use client'

import Link from 'next/link'
import { FileUp, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { initials } from '@/lib/utils'
import type { Author } from '@/types'

/**
 * Caixa de composicao no topo do feed (o "O que está acontecendo?" do X,
 * adaptado: aqui o gatilho e anexar um artigo).
 */
export function ComposeBox({ user }: { user: Author }) {
  return (
    <div className="border-b border-border px-4 py-4 sm:px-5">
      <div className="flex gap-3">
        <Avatar className="size-11 shrink-0">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Link
            href="/publicar"
            className="block w-full rounded-lg border border-dashed border-border px-4 py-3 text-[15px] text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/50"
          >
            Anexe seu artigo em .pdf ou .docx — o título e o resumo são extraídos
            automaticamente.
          </Link>

          {/* No mobile a coluna tem ~300px: os rotulos somem e sobram so os
              icones, senao o botao "Publicar" e empurrado para fora da tela. */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1">
              <Button asChild variant="ghost" size="sm" className="text-primary">
                <Link href="/publicar">
                  <FileUp className="size-4" />
                  <span className="hidden sm:inline">Anexar arquivo</span>
                  <span className="sr-only sm:hidden">Anexar arquivo</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-primary">
                <Link href="/buscador-ia">
                  <Sparkles className="size-4" />
                  <span className="hidden sm:inline">Buscar referências</span>
                  <span className="sr-only sm:hidden">Buscar referências</span>
                </Link>
              </Button>
            </div>
            <Button asChild size="sm">
              <Link href="/publicar">Publicar</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
