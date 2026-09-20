'use client'

import * as React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  /** Nota atual (aceita fracionada para exibicao, ex.: 4.3). */
  value: number
  /** Quando passado, o componente vira interativo (avaliacao do peer review). */
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  readOnly?: boolean
}

const sizes = { sm: 'size-3.5', md: 'size-[18px]', lg: 'size-6' }

/** Estrelas de 1 a 5 usadas na Avaliacao por pares (model Rating). */
export function StarRating({
  value,
  onChange,
  size = 'md',
  className,
  readOnly,
}: StarRatingProps) {
  const [hover, setHover] = React.useState<number | null>(null)
  const interactive = Boolean(onChange) && !readOnly
  const shown = hover ?? value

  return (
    <div className={cn('flex items-center gap-0.5', className)} role={interactive ? 'radiogroup' : 'img'}
         aria-label={`Avaliação ${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = shown >= star - 0.25
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(null)}
            onClick={() => onChange?.(star)}
            className={cn(
              'transition-transform',
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizes[size],
                filled ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/40'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
