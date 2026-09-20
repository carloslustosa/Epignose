import { SidebarNav } from './sidebar-nav'
import { MobileNav } from './mobile-nav'
import { RightSidebar } from './right-sidebar'
import { getCurrentUser } from '@/lib/auth'
import { currentUser as fallbackUser } from '@/lib/mock-data'

// ---------------------------------------------------------------------------
// Casca de tres colunas (estilo X):
//   [ navegacao ]  [ conteudo central ]  [ trending / sugestoes ]
//
// `showRightSidebar={false}` nas paginas que precisam de largura total,
// como o Buscador de Referencias IA.
// ---------------------------------------------------------------------------

export async function AppShell({
  children,
  showRightSidebar = true,
}: {
  children: React.ReactNode
  showRightSidebar?: boolean
}) {
  const user = (await getCurrentUser()) ?? fallbackUser

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] justify-center">
      <SidebarNav user={user} />

      <main className="w-full min-w-0 max-w-[720px] flex-1 border-x border-border pb-20 md:pb-0">
        {children}
      </main>

      {showRightSidebar && <RightSidebar />}

      <MobileNav />
    </div>
  )
}
