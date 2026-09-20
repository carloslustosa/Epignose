import { Info } from 'lucide-react'

/**
 * Aviso exibido quando a app esta rodando sem banco/chaves de API.
 * Some sozinho assim que o .env estiver preenchido (ver src/lib/env.ts).
 */
export function DemoBanner({ missing }: { missing: string[] }) {
  if (missing.length === 0) return null

  return (
    <div className="flex items-start gap-2.5 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs leading-relaxed text-amber-800 dark:text-amber-300 sm:px-5">
      <Info className="mt-px size-4 shrink-0" />
      <p>
        <strong className="font-semibold">Modo demonstração.</strong> Faltam no{' '}
        <code className="rounded bg-amber-500/20 px-1 py-0.5 font-mono">.env</code>:{' '}
        {missing.join(', ')}. Os dados abaixo são de exemplo — veja o{' '}
        <code className="rounded bg-amber-500/20 px-1 py-0.5 font-mono">README.md</code> para
        configurar.
      </p>
    </div>
  )
}
