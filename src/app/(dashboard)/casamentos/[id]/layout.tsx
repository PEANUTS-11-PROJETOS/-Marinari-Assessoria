import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { CasamentoBottomTabBar } from '@/components/shell/bottom-tab-bar'

export default async function CasamentoLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: casamento } = await supabase
    .from('casamentos')
    .select('id, noivo, noiva')
    .eq('id', id)
    .single()

  if (!casamento) notFound()

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh' }}>
      {/* Back bar — mobile + tablet (desktop usa sidebar) */}
      <div
        className="lg:hidden flex shrink-0 items-center px-5 pt-12 pb-2 sm:pt-6"
        style={{ background: 'var(--cream)' }}
      >
        <Link
          href="/casamentos"
          className="inline-flex items-center gap-1 transition-colors"
          style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted-foreground)' }}
        >
          <ChevronLeft className="h-4 w-4" />
          Casamentos
        </Link>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto pb-[82px] lg:pb-0">
        <div className="lg:max-w-3xl lg:mx-auto lg:px-8 lg:py-6 sm:px-4 sm:py-2">
          {children}
        </div>
      </div>

      <CasamentoBottomTabBar casamentoId={id} />
    </div>
  )
}
