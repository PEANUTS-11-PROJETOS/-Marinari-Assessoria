'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ConvidadoImportado } from '@/app/api/importar-convidados/route'

export async function inserirConvidadosImportados(
  casamentoId: string,
  convidados: ConvidadoImportado[]
) {
  if (!convidados.length) return { error: 'Nenhum convidado para importar' }

  const supabase = await createClient()
  const rows = convidados.map(c => ({ ...c, casamento_id: casamentoId }))

  const { error } = await supabase.from('convidados').insert(rows)
  if (error) return { error: error.message }

  revalidatePath(`/casamentos/${casamentoId}/convidados`)
  return { importados: convidados.length }
}
