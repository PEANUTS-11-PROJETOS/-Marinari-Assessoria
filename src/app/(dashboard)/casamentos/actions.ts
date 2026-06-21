'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const criarSchema = z.object({
  noivo: z.string().trim(),
  noiva: z.string().trim(),
}).refine(d => d.noivo || d.noiva, { message: 'Informe ao menos um dos noivos' })

export async function criarCasamento(formData: FormData) {
  const raw = { noivo: formData.get('noivo') as string, noiva: formData.get('noiva') as string }
  const parsed = criarSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data, error } = await supabase
    .from('casamentos')
    .insert({ ...parsed.data, user_id: user.id })
    .select('id')
    .single()

  if (error) return { error: error.message }
  redirect(`/casamentos/${data.id}/info`)
}

export async function excluirCasamento(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('casamentos').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/casamentos')
}
