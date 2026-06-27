'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, LayoutGrid, CircleDollarSign, MoreHorizontal } from 'lucide-react'

const TABS = [
  { segment: 'info',       label: 'Início',     Icon: Home              },
  { segment: 'convidados', label: 'Convidados', Icon: Users             },
  { segment: 'mesas',      label: 'Mesas',      Icon: LayoutGrid        },
  { segment: 'financeiro', label: 'Financeiro', Icon: CircleDollarSign  },
  { segment: 'mais',       label: 'Mais',       Icon: MoreHorizontal    },
]

export function CasamentoBottomTabBar({ casamentoId }: { casamentoId: string }) {
  const pathname = usePathname()

  return (
    /* Celular: 440px centralizado — Tablet: largura total — Desktop: oculto */
    <div
      className="lg:hidden fixed bottom-0 z-50
                 left-1/2 -translate-x-1/2 w-full max-w-[440px]
                 sm:left-0 sm:translate-x-0 sm:max-w-full"
      style={{
        background: 'rgba(255,253,251,0.92)',
        backdropFilter: 'blur(18px) saturate(160%)',
        WebkitBackdropFilter: 'blur(18px) saturate(160%)',
        borderTop: '1px solid var(--line)',
      }}
    >
      <div className="flex items-stretch sm:max-w-2xl sm:mx-auto">
        {TABS.map(({ segment, label, Icon }) => {
          const href = `/casamentos/${casamentoId}/${segment}`
          const active = pathname.endsWith(`/${segment}`) || pathname.includes(`/${segment}/`)
          return (
            <Link
              key={segment}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2 pb-3 transition-colors"
              style={{ color: active ? 'var(--terracotta)' : 'var(--muted-foreground)' }}
            >
              <Icon size={23} strokeWidth={active ? 2.1 : 1.8} />
              <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, letterSpacing: 0.1 }}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
