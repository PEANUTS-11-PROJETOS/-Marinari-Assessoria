import { createAdminClient } from '@/lib/supabase/admin'
import { UserList } from './user-list'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const admin = createAdminClient()
  const { data: { users } } = await admin.auth.admin.listUsers()

  const adminEmail = process.env.ADMIN_EMAIL ?? ''

  return (
    <div style={{ minHeight: '100vh', background: '#FBF4EF' }}>
      {/* Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid var(--line)', padding: '20px 32px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[12px] shrink-0"
            style={{
              background: 'linear-gradient(145deg, var(--blush) 0%, var(--rose) 100%)',
              color: 'white', fontSize: 18, fontFamily: 'var(--font-serif)',
            }}
          >
            ♡
          </div>
          <div>
            <p style={{ fontSize: 11.5, color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Marinari Assessoria
            </p>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1 }}>
              Admin
            </h1>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 32px 60px' }}>
        <UserList users={users} adminEmail={adminEmail} />
      </div>
    </div>
  )
}
