'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarDays, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

const navLinks = [
  { href: '/casamentos',    label: 'Casamentos',   icon: CalendarDays },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router   = useRouter()

  async function sair() {
    onClose?.()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-background">
      <div className="flex h-14 items-center gap-2.5 px-5 border-b">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md font-serif-display text-xl leading-none text-white"
          style={{ background: 'linear-gradient(150deg, var(--blush) 0%, var(--rose) 100%)' }}
        >
          ♡
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-medium tracking-tight">Marinari Assessoria</span>
          <span className="text-[10px] text-muted-foreground">by Peanuts Labs</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pt-4">
        <p className="eyebrow px-3 pb-1.5">Menu</p>
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                active
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t">
        <button
          onClick={sair}
          className="flex w-full h-9 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
