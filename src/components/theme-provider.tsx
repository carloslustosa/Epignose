'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

/** Dark mode nativo: adiciona/remove a classe .dark no <html>. */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
