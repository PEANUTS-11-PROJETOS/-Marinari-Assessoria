'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, LayoutGrid, CircleDollarSign, MoreHorizontal, ChevronLeft, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const TABS = [
  { segment: 'info',       label: 'Início',     Icon: Home             },
  { segment: 'convidados', label: 'Convidados', Icon: Users            },
  { segment: 'mesas',      label: 'Mesas',      Icon: LayoutGrid       },
  { segment: 'financeiro', label: 'Financeiro', Icon: CircleDollarSign },
  { segment: 'mais',       label: 'Mais',       Icon: MoreHorizontal   },
]

export function DesktopSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const match = pathname.match(/\/casamentos\/([^/]+)/)
  const casamentoId = match?.[1]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: 260,
        background: '#FFFFFF',
        borderRight: '1px solid var(--line)',
        boxShadow: '1px 0 12px rgba(120,55,40,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-8 pb-6">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-[12px] text-white"
          style={{
            background: 'linear-gradient(145deg, var(--blush) 0%, var(--rose) 100%)',
            fontSize: 18,
            fontFamily: 'var(--font-serif)',
          }}
        >
          ♡
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Marinari Assessoria</span>
          <span style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>by Peanuts Labs</span>
        </div>
      </div>

      <div className="flex-1 px-3 pb-3 space-y-0.5">
        {casamentoId ? (
          <>
            <Link
              href="/casamentos"
              className="flex items-center gap-2 rounded-[10px] px-3 py-2.5 mb-2 transition-colors hover:bg-[var(--blush-tint)]"
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)' }}
            >
              <ChevronLeft size={15} />
              Casamentos
            </Link>

            <p className="px-3 pb-1" style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Navegação
            </p>

            {TABS.map(({ segment, label, Icon }) => {
              const href = `/casamentos/${casamentoId}/${segment}`
              const active = pathname.endsWith(`/${segment}`) || pathname.includes(`/${segment}/`)
              return (
                <Link
                  key={segment}
                  href={href}
                  className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 transition-colors"
                  style={{
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    color: active ? 'var(--terracotta)' : 'var(--ink)',
                    background: active ? 'var(--blush-tint)' : 'transparent',
                  }}
                >
                  <Icon size={18} strokeWidth={active ? 2.1 : 1.8} />
                  {label}
                </Link>
              )
            })}
          </>
        ) : (
          <Link
            href="/casamentos"
            className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 transition-colors"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--terracotta)',
              background: 'var(--blush-tint)',
            }}
          >
            <Home size={18} strokeWidth={2.1} />
            Casamentos
          </Link>
        )}
      </div>
      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 transition-colors hover:bg-red-50"
          style={{ fontSize: 14, fontWeight: 500, color: '#B5564A' }}
        >
          <LogOut size={17} strokeWidth={1.8} />
          Sair da conta
        </button>
      </div>
    </aside>
  )
}
