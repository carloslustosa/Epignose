'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Evita mismatch de hidratacao: no servidor nao sabemos o tema do usuario.
  React.useEffect(() => setMounted(true), [])

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label="Alternar tema"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {mounted && resolvedTheme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
