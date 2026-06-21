import { createClient } from '@/lib/supabase/server'
import { iniciais } from '@/lib/utils'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const nome = user?.email ?? '?'
  const ini  = iniciais(nome.split('@')[0])

  return (
    <header className="flex flex-1 items-center justify-end bg-background px-6 gap-3">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
          {ini}
        </span>
        <span className="text-sm font-medium hidden sm:block">{user?.email}</span>
      </div>
    </header>
  )
}
