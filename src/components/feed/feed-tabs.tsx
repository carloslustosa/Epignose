'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/** Abas "Para você" / "Seguindo" / "Da minha área" — formato X. */
const tabs = [
  { id: 'para-voce', label: 'Para você' },
  { id: 'seguindo', label: 'Seguindo' },
  { id: 'minha-area', label: 'Da minha área' },
]

export function FeedTabs({ onChange }: { onChange?: (id: string) => void }) {
  const [active, setActive] = React.useState(tabs[0].id)

  return (
    <div className="flex" role="tablist" aria-label="Filtrar feed">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => {
            setActive(tab.id)
            onChange?.(tab.id)
          }}
          className="group relative flex-1 px-4 py-3.5 text-sm transition-colors hover:bg-accent"
        >
          <span
            className={cn(
              'relative inline-block pb-3',
              active === tab.id ? 'font-semibold text-foreground' : 'text-muted-foreground'
            )}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute inset-x-0 -bottom-[13px] h-1 rounded-full bg-primary" />
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
