'use client'
import { useTransition } from 'react'
import { toggleBloqueio } from './actions'
import { fmtData } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

export function UserList({ users, adminEmail }: { users: User[]; adminEmail: string }) {
  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{ background: '#FFFFFF', border: '1px solid var(--line)', boxShadow: '0 2px 10px rgba(120,55,40,0.05)' }}
    >
      <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--line)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
          Usuários cadastrados
        </h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted-foreground)', marginTop: 3 }}>
          {users.length} conta{users.length !== 1 ? 's' : ''} no sistema
        </p>
      </div>

      <div>
        {users.map((u, i) => (
          <UserRow
            key={u.id}
            user={u}
            isAdmin={u.email?.toLowerCase() === adminEmail.toLowerCase()}
            isLast={i === users.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

function UserRow({ user, isAdmin, isLast }: { user: User; isAdmin: boolean; isLast: boolean }) {
  const [pending, start] = useTransition()

  const banned = user.banned_until && new Date(user.banned_until) > new Date()

  function handleToggle() {
    start(() => toggleBloqueio(user.id, !banned))
  }

  return (
    <div
      className="flex items-center gap-4 px-6 py-4"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--line)' }}
    >
      {/* Avatar */}
      <div
        className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-white font-semibold"
        style={{
          background: banned
            ? '#D1D5DB'
            : 'linear-gradient(145deg, var(--blush) 0%, var(--rose) 100%)',
          fontSize: 13,
        }}
      >
        {(user.email?.[0] ?? '?').toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate" style={{ fontWeight: 600, fontSize: 14, color: banned ? 'var(--muted-foreground)' : 'var(--ink)' }}>
          {user.email}
        </p>
        <p style={{ fontSize: 11.5, color: 'var(--muted-foreground)', marginTop: 1 }}>
          Cadastro {fmtData(user.created_at.slice(0, 10))}
          {user.last_sign_in_at && ` · Último acesso ${fmtData(user.last_sign_in_at.slice(0, 10))}`}
        </p>
      </div>

      {/* Badge status */}
      <span
        className="shrink-0 px-3 py-1 rounded-full font-semibold"
        style={{
          fontSize: 11,
          background: banned ? 'rgba(239,68,68,0.08)' : 'rgba(94,140,106,0.10)',
          color: banned ? '#DC2626' : '#46765A',
        }}
      >
        {banned ? 'Bloqueado' : 'Ativo'}
      </span>

      {/* Toggle */}
      {!isAdmin && (
        <button
          onClick={handleToggle}
          disabled={pending}
          className="shrink-0 rounded-[10px] px-4 py-2 font-semibold transition-colors"
          style={{
            fontSize: 12.5,
            background: banned ? 'var(--blush-tint)' : 'rgba(239,68,68,0.07)',
            color: banned ? 'var(--terracotta)' : '#DC2626',
            opacity: pending ? 0.5 : 1,
            border: 'none',
            cursor: pending ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? '…' : banned ? 'Liberar' : 'Bloquear'}
        </button>
      )}

      {isAdmin && (
        <span style={{ fontSize: 11, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
          Admin
        </span>
      )}
    </div>
  )
}
