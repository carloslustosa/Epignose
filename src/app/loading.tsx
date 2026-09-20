import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton do feed enquanto o Server Component resolve. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[720px] space-y-6 px-5 py-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
