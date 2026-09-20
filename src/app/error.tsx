'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <AlertTriangle className="size-12 text-destructive" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Algo deu errado</h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {error.message || 'Ocorreu um erro inesperado ao carregar esta página.'}
        </p>
      </div>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  )
}
