import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Configurações</h1>
      <p className="text-sm text-muted-foreground">Email: <span className="text-foreground">{user.email}</span></p>
    </div>
  )
}
