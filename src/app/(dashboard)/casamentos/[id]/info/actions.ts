'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const infoSchema = z.object({
  noivo:               z.string().trim().default(''),
  noiva:               z.string().trim().default(''),
  data_evento:         z.string().trim().optional(),
  horario:             z.string().trim().optional(),
  local:               z.string().trim().optional(),
  endereco:            z.string().trim().optional(),
  total_convidados:    z.coerce.number().int().nonnegative().optional(),
})

export async function salvarInfo(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = infoSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.from('casamentos').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/casamentos/${id}/info`)
  return { success: true }
}
