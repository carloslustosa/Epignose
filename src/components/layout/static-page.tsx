import { AppShell } from './app-shell'
import { PageHeader } from './page-header'

/** Casca das paginas institucionais (Sobre, Diretrizes, Privacidade, Termos). */
export function StaticPage({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <AppShell>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="px-5 py-7 sm:px-8">
        <div className="prose-article max-w-[68ch]">{children}</div>
      </div>
    </AppShell>
  )
}
