'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const servicoSchema = z.object({
  nome:  z.string().trim().min(1, 'Nome obrigatório'),
  total: z.coerce.number().nonnegative(),
  pago:  z.coerce.number().nonnegative(),
})

export async function criarServico(casamentoId: string, formData: FormData) {
  const parsed = servicoSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { error } = await supabase.from('servicos_financeiros').insert({ ...parsed.data, casamento_id: casamentoId })
  if (error) return { error: error.message }
  revalidatePath(`/casamentos/${casamentoId}/financeiro`)
}

export async function atualizarServico(casamentoId: string, servicoId: string, formData: FormData) {
  const parsed = servicoSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { error } = await supabase.from('servicos_financeiros').update(parsed.data).eq('id', servicoId)
  if (error) return { error: error.message }
  revalidatePath(`/casamentos/${casamentoId}/financeiro`)
}

export async function excluirServico(casamentoId: string, servicoId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('servicos_financeiros').delete().eq('id', servicoId)
  if (error) return { error: error.message }
  revalidatePath(`/casamentos/${casamentoId}/financeiro`)
}
