import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CasamentosList } from '@/components/casamentos/casamentos-list'
import { NovoCasamentoDialog } from '@/components/casamentos/novo-casamento-dialog'

export default async function CasamentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: casamentos } = await supabase
    .from('casamentos')
    .select('*')
    .order('data_evento', { ascending: true })

  return (
    <div className="space-y-6 px-5 pt-6 pb-6 md:max-w-3xl md:mx-auto md:px-8 md:py-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--rose)', letterSpacing: '0.3px' }}>Bom dia ✦</p>
          <h1 className="font-serif-display text-[2rem] leading-tight mt-0.5" style={{ color: 'var(--ink)' }}>
            Seus casamentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {casamentos?.length ?? 0} evento{(casamentos?.length ?? 0) !== 1 ? 's' : ''} cadastrado{(casamentos?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <NovoCasamentoDialog />
      </div>
      <CasamentosList casamentos={casamentos ?? []} />
    </div>
  )
}
