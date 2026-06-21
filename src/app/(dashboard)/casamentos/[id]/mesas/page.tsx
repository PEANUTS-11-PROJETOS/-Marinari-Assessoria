import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MesasView } from '@/components/mesas/mesas-view'

export default async function MesasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: convidados }, { data: casamento }] = await Promise.all([
    supabase.from('convidados').select('*').eq('casamento_id', id).order('nome'),
    supabase.from('casamentos').select('total_mesas, capacidade_por_mesa').eq('id', id).single(),
  ])

  return (
    <MesasView
      casamentoId={id}
      convidados={convidados ?? []}
      totalMesas={casamento?.total_mesas ?? null}
      capacidade={casamento?.capacidade_por_mesa ?? null}
    />
  )
}
