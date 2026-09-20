import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Marca do Epignose. O simbolo e um "olho" formado por duas chaves de
 * citação — leitura atenta, que e o que a plataforma faz com os artigos.
 */
export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2.5 transition-opacity hover:opacity-80', className)}
      aria-label="Epignose — página inicial"
    >
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <circle cx="16" cy="16" r="15" className="fill-primary" />
        <path
          d="M6 16c3.2-4.6 6.5-6.9 10-6.9S22.8 11.4 26 16c-3.2 4.6-6.5 6.9-10 6.9S9.2 20.6 6 16Z"
          className="fill-primary-foreground"
        />
        <circle cx="16" cy="16" r="3.6" className="fill-primary" />
      </svg>
      {!compact && (
        <span className="text-xl font-semibold tracking-tight">
          Epignose
        </span>
      )}
    </Link>
  )
}
