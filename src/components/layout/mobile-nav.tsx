'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Sparkles, PenSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'

// Barra inferior no mobile — mesma navegacao do sidebar, formato Instagram.
const items = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/explorar', label: 'Explorar', icon: Compass },
  { href: '/publicar', label: 'Publicar', icon: PenSquare },
  { href: '/buscador-ia', label: 'Buscador IA', icon: Sparkles },
  { href: '/perfil', label: 'Perfil', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <ul className="flex items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-0.5 py-2.5"
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={cn('size-5', active ? 'text-primary' : 'text-muted-foreground')} />
                <span
                  className={cn(
                    'text-[10px]',
                    active ? 'font-medium text-primary' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
