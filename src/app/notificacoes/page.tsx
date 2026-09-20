import Link from 'next/link'
import type { Metadata } from 'next'
import { Heart, MessageSquareQuote, Star, UserPlus, ShieldAlert } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { PageHeader } from '@/components/layout/page-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, initials, timeAgo } from '@/lib/utils'
import { suggestedResearchers, mockPosts } from '@/lib/mock-data'

export const metadata: Metadata = {
  title: 'Notificações',
  description: 'Atividade sobre suas publicações.',
}

// ---------------------------------------------------------------------------
// NOTIFICACOES.
//
// Com banco, crie um model Notification (type, actorId, postId, readAt) e
// grave um registro nas Server Actions de curtida, comentario e avaliacao.
// ---------------------------------------------------------------------------

const ICONS = {
  CRITIQUE: { icon: MessageSquareQuote, tone: 'text-primary' },
  RATING: { icon: Star, tone: 'text-amber-500' },
  LIKE: { icon: Heart, tone: 'text-rose-500' },
  FOLLOW: { icon: UserPlus, tone: 'text-emerald-600 dark:text-emerald-400' },
  PLAGIARISM: { icon: ShieldAlert, tone: 'text-amber-600 dark:text-amber-400' },
} as const

const notifications = [
  {
    id: 'n1',
    type: 'CRITIQUE' as const,
    actor: suggestedResearchers[1],
    text: 'deixou um apontamento metodológico sobre a distribuição da sua amostra.',
    post: mockPosts[0],
    hoursAgo: 3,
    unread: true,
  },
  {
    id: 'n2',
    type: 'RATING' as const,
    actor: suggestedResearchers[2],
    text: 'avaliou seu artigo com 5 estrelas em rigor metodológico.',
    post: mockPosts[0],
    hoursAgo: 8,
    unread: true,
  },
  {
    id: 'n3',
    type: 'FOLLOW' as const,
    actor: suggestedResearchers[0],
    text: 'começou a seguir você.',
    post: null,
    hoursAgo: 20,
    unread: true,
  },
  {
    id: 'n4',
    type: 'LIKE' as const,
    actor: suggestedResearchers[1],
    text: 'e outros 42 pesquisadores curtiram sua publicação.',
    post: mockPosts[0],
    hoursAgo: 30,
    unread: false,
  },
]

export default function NotificacoesPage() {
  return (
    <AppShell>
      <PageHeader title="Notificações" subtitle="Atividade sobre suas publicações" />

      <ul>
        {notifications.map((n) => {
          const { icon: Icon, tone } = ICONS[n.type]
          const date = new Date(Date.now() - n.hoursAgo * 3600_000).toISOString()

          return (
            <li key={n.id}>
              <Link
                href={n.post ? `/artigo/${n.post.id}` : `/perfil/${n.actor.handle}`}
                className={cn(
                  'flex gap-3 border-b border-border px-4 py-4 transition-colors hover:bg-accent/40 sm:px-5',
                  n.unread && 'bg-primary/[0.04]'
                )}
              >
                <Icon className={cn('mt-0.5 size-5 shrink-0', tone)} />

                <div className="min-w-0 flex-1">
                  <Avatar className="mb-2 size-8">
                    <AvatarFallback className="text-[10px]">
                      {initials(n.actor.name)}
                    </AvatarFallback>
                  </Avatar>

                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">{n.actor.name}</span> {n.text}
                  </p>

                  {n.post && (
                    <p className="mt-1 truncate text-sm text-muted-foreground">{n.post.title}</p>
                  )}

                  <time className="mt-1 block text-xs text-muted-foreground" dateTime={date}>
                    {timeAgo(date)}
                  </time>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </AppShell>
  )
}
