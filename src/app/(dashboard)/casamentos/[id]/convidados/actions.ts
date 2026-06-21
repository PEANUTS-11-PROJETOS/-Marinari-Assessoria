'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const convidadoSchema = z.object({
  nome:             z.string().trim().min(1, 'Nome obrigatório'),
  faixa_etaria:     z.string().trim().optional(),
  contato_whatsapp: z.string().trim().optional(),
  tipo:             z.string().trim().optional(),
  mesa:             z.string().trim().optional(),
  presenca:         z.enum(['confirmado', 'pendente', 'recusado']).default('pendente'),
  observacao:       z.string().trim().optional(),
})

export async function criarConvidado(casamentoId: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = convidadoSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.from('convidados').insert({ ...parsed.data, casamento_id: casamentoId })
  if (error) return { error: error.message }
  revalidatePath(`/casamentos/${casamentoId}/convidados`)
}

export async function atualizarConvidado(casamentoId: string, convidadoId: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = convidadoSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.from('convidados').update(parsed.data).eq('id', convidadoId)
  if (error) return { error: error.message }
  revalidatePath(`/casamentos/${casamentoId}/convidados`)
}

export async function excluirConvidado(casamentoId: string, convidadoId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('convidados').delete().eq('id', convidadoId)
  if (error) return { error: error.message }
  revalidatePath(`/casamentos/${casamentoId}/convidados`)
}
