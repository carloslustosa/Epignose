import { cn } from '@/lib/utils'

/** Cabecalho fixo do conteudo central, com blur — igual ao do X. */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
  children,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
  children?: React.ReactNode
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-5',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </header>
  )
}
