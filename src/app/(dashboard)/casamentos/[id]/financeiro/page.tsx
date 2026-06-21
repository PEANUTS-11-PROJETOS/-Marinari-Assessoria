import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ServicosTable } from '@/components/financeiro/servicos-table'
import { CronogramaFinanceiro } from '@/components/financeiro/cronograma-mensal'

export default async function FinanceiroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: servicos }, { data: parcelas }, { data: casamento }] = await Promise.all([
    supabase.from('servicos_financeiros').select('*, contratos(*)').eq('casamento_id', id).order('created_at'),
    supabase.from('parcelas_mensais').select('*').eq('casamento_id', id).order('data_vencimento'),
    supabase.from('casamentos').select('data_evento').eq('id', id).single(),
  ])

  const anoReferencia = casamento?.data_evento
    ? new Date(casamento.data_evento + 'T00:00:00').getFullYear()
    : new Date().getFullYear()

  return (
    <div className="space-y-8">
      <ServicosTable casamentoId={id} servicos={servicos ?? []} />
      <div
        className="mx-5 mb-6 rounded-[20px] p-5 md:mx-0"
        style={{ border: '1px solid var(--line)', background: 'var(--card)', boxShadow: '0 2px 10px rgba(142,59,46,0.05)' }}
      >
        <CronogramaFinanceiro
          casamentoId={id}
          parcelas={parcelas ?? []}
          servicos={servicos?.map(({ id, nome, total, pago, casamento_id, created_at }) => ({ id, nome, total, pago, casamento_id, created_at })) ?? []}
          anoReferencia={anoReferencia}
        />
      </div>
    </div>
  )
}
