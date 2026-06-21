import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConvidadosTable } from '@/components/convidados/convidados-table'

export default async function ConvidadosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: convidados }, { data: casamento }] = await Promise.all([
    supabase.from('convidados').select('*').eq('casamento_id', id).order('nome'),
    supabase.from('casamentos').select('noivo, noiva, data_evento, local').eq('id', id).single(),
  ])

  return (
    <ConvidadosTable
      casamentoId={id}
      convidados={convidados ?? []}
      casamento={casamento ?? undefined}
    />
  )
}
