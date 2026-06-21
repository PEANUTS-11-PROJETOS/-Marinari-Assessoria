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
      {/* Back bar — mobile only (desktop usa sidebar) */}
      <div
        className="md:hidden flex shrink-0 items-center px-5 pt-12 pb-2"
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
      <div className="flex-1 overflow-y-auto pb-[82px] md:pb-0">
        <div className="md:max-w-3xl md:mx-auto md:px-8 md:py-6">
          {children}
        </div>
      </div>

      <CasamentoBottomTabBar casamentoId={id} />
    </div>
  )
}
