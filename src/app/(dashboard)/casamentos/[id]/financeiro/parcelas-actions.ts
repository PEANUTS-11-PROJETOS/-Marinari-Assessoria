'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

const schema = z.object({
  descricao:       z.string().trim().min(1, 'Informe uma descrição'),
  valor:           z.coerce.number().min(0),
  data_vencimento: z.string().regex(/^\d{4}-\d{2}$/, 'Mês inválido'),
  servico_id:      z.string().uuid().optional().nullable(),
  pago:            z.coerce.boolean().optional().default(false),
})

function revalida(casamentoId: string) {
  revalidatePath(`/casamentos/${casamentoId}/financeiro`)
}

// Soma parcelas pagas do serviço e atualiza servicos_financeiros.pago
async function recalcularServico(supabase: SupabaseClient, servicoId: string) {
  const { data } = await supabase
    .from('parcelas_mensais')
    .select('valor')
    .eq('servico_id', servicoId)
    .eq('pago', true)

  const total = data?.reduce((s, p) => s + Number(p.valor), 0) ?? 0

  await supabase
    .from('servicos_financeiros')
    .update({ pago: total })
    .eq('id', servicoId)
}

export async function salvarParcela(casamentoId: string, parcelaId: string | null, fd: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const raw = Object.fromEntries(fd)
  // campo vazio → null
  if (!raw.servico_id) raw.servico_id = null as unknown as string

  const parsed = schema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { descricao, valor, data_vencimento, pago, servico_id } = parsed.data
  const data = `${data_vencimento}-01`

  // IDs de serviços que precisam ser recalculados
  const servicosParaRecalcular = new Set<string>()

  if (parcelaId) {
    // Busca servico_id antigo para recalcular caso mude
    const { data: antiga } = await supabase
      .from('parcelas_mensais')
      .select('servico_id')
      .eq('id', parcelaId)
      .single()

    if (antiga?.servico_id) servicosParaRecalcular.add(antiga.servico_id)

    const { error } = await supabase
      .from('parcelas_mensais')
      .update({ descricao, valor, data_vencimento: data, pago, servico_id: servico_id ?? null })
      .eq('id', parcelaId)
      .eq('casamento_id', casamentoId)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('parcelas_mensais')
      .insert({ casamento_id: casamentoId, descricao, valor, data_vencimento: data, pago, servico_id: servico_id ?? null })
    if (error) return { error: error.message }
  }

  if (servico_id) servicosParaRecalcular.add(servico_id)
  await Promise.all([...servicosParaRecalcular].map(id => recalcularServico(supabase, id)))

  revalida(casamentoId)
  return { ok: true }
}

export async function excluirParcela(casamentoId: string, parcelaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Busca servico_id antes de deletar para recalcular depois
  const { data: parcela } = await supabase
    .from('parcelas_mensais')
    .select('servico_id')
    .eq('id', parcelaId)
    .single()

  const { error } = await supabase
    .from('parcelas_mensais')
    .delete()
    .eq('id', parcelaId)
    .eq('casamento_id', casamentoId)

  if (error) return { error: error.message }

  if (parcela?.servico_id) await recalcularServico(supabase, parcela.servico_id)

  revalida(casamentoId)
  return { ok: true }
}

export async function toggleParcela(casamentoId: string, parcelaId: string, pago: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: parcela, error } = await supabase
    .from('parcelas_mensais')
    .update({ pago })
    .eq('id', parcelaId)
    .eq('casamento_id', casamentoId)
    .select('servico_id')
    .single()

  if (error) return { error: error.message }

  if (parcela?.servico_id) await recalcularServico(supabase, parcela.servico_id)

  revalida(casamentoId)
  return { ok: true }
}
