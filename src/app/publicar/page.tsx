import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { UploadForm } from '@/components/feed/upload-form'

export const metadata: Metadata = {
  title: 'Publicar artigo',
  description: 'Anexe seu artigo em PDF ou DOCX. Título e resumo são extraídos automaticamente.',
}

export default function PublicarPage() {
  return (
    <AppShell showRightSidebar={false}>
      <PageHeader
        title="Publicar artigo"
        subtitle="PDF ou DOCX · até 25 MB · verificação anti-plágio automática"
      />
      <div className="px-4 py-6 sm:px-6">
        <UploadForm />
      </div>
    </AppShell>
  )
}
