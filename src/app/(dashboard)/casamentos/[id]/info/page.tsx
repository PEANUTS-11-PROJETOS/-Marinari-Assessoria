import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DashB } from '@/components/dashboard/dash-b'

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const event = new Date(dateStr + 'T00:00:00')
  event.setHours(0, 0, 0, 0)
  return Math.round((event.getTime() - today.getTime()) / 86_400_000)
}

export default async function InfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: casamento },
    { data: convidados },
    { data: servicos },
  ] = await Promise.all([
    supabase.from('casamentos').select('*').eq('id', id).single(),
    supabase.from('convidados').select('presenca, mesa').eq('casamento_id', id),
    supabase.from('servicos_financeiros').select('total, pago').eq('casamento_id', id),
  ])

  if (!casamento) notFound()

  const guests = convidados ?? []
  const total = guests.length
  const confirmados = guests.filter(g => g.presenca === 'confirmado').length
  const semMesa = guests.filter(g => !g.mesa).length

  const services = servicos ?? []
  const totalGeral = services.reduce((s, r) => s + (r.total ?? 0), 0)
  const totalPago = services.reduce((s, r) => s + (r.pago ?? 0), 0)
  const pagoPct = totalGeral > 0 ? Math.round((totalPago / totalGeral) * 100) : 0

  const dias = daysUntil(casamento.data_evento)

  return (
    <DashB
      casamentoId={id}
      casamento={casamento}
      stats={{ total, confirmados, semMesa, pagoPct, totalPago, totalGeral, dias }}
    />
  )
}
