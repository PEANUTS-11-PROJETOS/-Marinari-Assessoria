'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Info',       segment: 'info'      },
  { label: 'Convidados', segment: 'convidados' },
  { label: 'Mesas',      segment: 'mesas'      },
  { label: 'Financeiro', segment: 'financeiro' },
]

export function CasamentoTabs({ casamentoId }: { casamentoId: string }) {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 border-b mb-6">
      {tabs.map(t => {
        const href = `/casamentos/${casamentoId}/${t.segment}`
        const active = pathname.startsWith(href)
        return (
          <Link
            key={t.segment}
            href={href}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              active
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}
