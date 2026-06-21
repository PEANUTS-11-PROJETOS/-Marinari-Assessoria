import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { MaisScreen } from '@/components/mais/mais-screen'

export default async function MaisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: casamento } = await supabase.from('casamentos').select('*').eq('id', id).single()
  if (!casamento) notFound()

  return (
    <div className="pt-5">
      <div className="px-5 pb-4">
        <h1 className="font-serif-display" style={{ fontSize: 26, color: 'var(--ink)' }}>Mais</h1>
      </div>
      <MaisScreen casamento={casamento} />
    </div>
  )
}
