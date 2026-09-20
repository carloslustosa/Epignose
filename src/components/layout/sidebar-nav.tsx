'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Compass,
  Sparkles,
  Bookmark,
  Bell,
  User,
  Settings,
  PenSquare,
} from 'lucide-react'
import { cn, initials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Logo } from './logo'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Author } from '@/types'

// ---------------------------------------------------------------------------
// SIDEBAR ESQUERDO — navegacao principal (estilo X/Twitter).
// Fixo em telas grandes; vira barra inferior no mobile (ver mobile-nav.tsx).
// ---------------------------------------------------------------------------

const navItems = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/explorar', label: 'Explorar', icon: Compass },
  { href: '/buscador-ia', label: 'Buscador IA', icon: Sparkles, highlight: true },
  { href: '/biblioteca', label: 'Biblioteca', icon: Bookmark },
  { href: '/notificacoes', label: 'Notificações', icon: Bell, badge: 3 },
  { href: '/perfil', label: 'Perfil', icon: User },
]

export function SidebarNav({ user }: { user: Author }) {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-screen w-[88px] shrink-0 flex-col justify-between border-r border-border px-3 py-5 md:flex xl:w-[268px] xl:px-4">
      <div className="flex flex-col gap-1">
        <div className="mb-4 px-2 xl:px-3">
          <Logo compact className="xl:hidden" />
          <Logo className="hidden xl:flex" />
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon, highlight, badge }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'group relative flex items-center gap-4 rounded-full px-3 py-3 transition-colors',
                  'hover:bg-accent',
                  active && 'font-semibold',
                  'justify-center xl:justify-start'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="relative">
                  <Icon
                    className={cn(
                      'size-6 shrink-0',
                      active ? 'text-primary' : 'text-foreground',
                      highlight && !active && 'text-primary/80'
                    )}
                  />
                  {badge ? (
                    <span className="absolute -right-1.5 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span className="hidden text-base xl:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        <Button asChild size="lg" className="mt-4 hidden w-full xl:flex">
          <Link href="/publicar">
            <PenSquare className="size-[18px]" />
            Publicar artigo
          </Link>
        </Button>
        <Button asChild size="icon" className="mx-auto mt-4 size-12 xl:hidden">
          <Link href="/publicar" aria-label="Publicar artigo">
            <PenSquare className="size-5" />
          </Link>
        </Button>
      </div>

      {/* Rodape: usuario logado + tema */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-center xl:justify-between">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="hidden xl:flex" aria-label="Configurações">
            <Settings />
          </Button>
        </div>

        <Link
          href={`/perfil/${user.handle}`}
          className="flex items-center gap-3 rounded-full p-2 transition-colors hover:bg-accent xl:px-3"
        >
          <Avatar className="size-9 shrink-0">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 flex-1 xl:block">
            <p className="truncate text-sm font-semibold leading-tight">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">@{user.handle}</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
