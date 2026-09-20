import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Helper padrao do shadcn/ui: junta classes condicionais sem conflito no Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** "há 3 horas", "há 2 dias" — datas relativas em pt-BR. */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

  const steps: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [604800, 'day'],
    [2629800, 'week'],
    [31557600, 'month'],
  ]

  for (let i = 0; i < steps.length; i++) {
    const [limit, unit] = steps[i]
    if (diff < limit) {
      const divisor = i === 0 ? 1 : steps[i - 1][0]
      return rtf.format(-Math.floor(diff / divisor), unit)
    }
  }
  return rtf.format(-Math.floor(diff / 31557600), 'year')
}

/** Data academica por extenso: "12 de março de 2026". */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Formata bytes: 1048576 -> "1,0 MB" */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(1).replace('.', ',')} ${units[i]}`
}

/** 12400 -> "12,4 mil" */
export function formatCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace('.', ',')} mil`
  return `${(n / 1_000_000).toFixed(1).replace('.', ',')} mi`
}

/** Corta um texto em `max` caracteres sem quebrar palavra. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')) + '…'
}

/** "Direito Digital" -> "direito-digital" */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Iniciais para o fallback do avatar: "Ana Paula Lima" -> "AL" */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
