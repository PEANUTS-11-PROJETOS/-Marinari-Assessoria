import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const formData    = await request.formData()
  const arquivo     = formData.get('arquivo') as File | null
  const casamentoId = formData.get('casamento_id') as string
  const servicoId   = formData.get('servico_id') as string

  if (!arquivo || !casamentoId || !servicoId)
    return NextResponse.json({ error: 'Parâmetros obrigatórios faltando' }, { status: 400 })

  const storagePath = `${user.id}/${casamentoId}/${servicoId}/${arquivo.name}`
  const { error: uploadError } = await supabase.storage
    .from('contratos').upload(storagePath, arquivo, { upsert: true })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { error: dbError } = await supabase.from('contratos').insert({
    casamento_id: casamentoId, servico_id: servicoId,
    nome_arquivo: arquivo.name, storage_path: storagePath, tamanho: arquivo.size,
  })
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { contratoId, storagePath } = await request.json()
  const { error: storageError } = await supabase.storage.from('contratos').remove([storagePath])
  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 })

  const { error: dbError } = await supabase.from('contratos').delete().eq('id', contratoId)
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
