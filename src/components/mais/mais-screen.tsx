'use client'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { salvarCasamento } from '@/app/(dashboard)/casamentos/[id]/mais/actions'
import type { Casamento } from '@/types'

const schema = z.object({
  noivo:               z.string().trim(),
  noiva:               z.string().trim(),
  data_evento:         z.string().optional(),
  horario:             z.string().optional(),
  local:               z.string().optional(),
  endereco:            z.string().optional(),
  total_convidados:    z.string().optional(),
  total_mesas:         z.string().optional(),
  capacidade_por_mesa: z.string().optional(),
})
type F = z.infer<typeof schema>

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-5 pt-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-[9px]"
          style={{ background: 'var(--blush-tint)', color: 'var(--rosewood)' }}>
          {icon}
        </div>
        <p className="eyebrow">{title}</p>
      </div>
      <div className="mx-5 rounded-[20px] divide-y bg-card"
        style={{ border: '1px solid var(--line)', overflow: 'hidden' }}>
        {children}
      </div>
    </section>
  )
}

function Field({
  label, type = 'text', placeholder,
  registration,
}: {
  label: string; type?: string; placeholder?: string
  registration: ReturnType<ReturnType<typeof useForm<F>>['register']>
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="bg-transparent outline-none"
        style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}
        {...registration}
      />
    </div>
  )
}

export function MaisScreen({ casamento }: { casamento: Casamento }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: {
      noivo:               casamento.noivo ?? '',
      noiva:               casamento.noiva ?? '',
      data_evento:         casamento.data_evento ?? '',
      horario:             casamento.horario ?? '',
      local:               casamento.local ?? '',
      endereco:            casamento.endereco ?? '',
      total_convidados:    casamento.total_convidados?.toString() ?? '',
      total_mesas:         casamento.total_mesas?.toString() ?? '',
      capacidade_por_mesa: casamento.capacidade_por_mesa?.toString() ?? '',
    },
  })

  function onSubmit(values: F) {
    startTransition(async () => {
      const fd = new FormData()
      Object.entries(values).forEach(([k, v]) => { if (v) fd.set(k, v) })
      const r = await salvarCasamento(casamento.id, fd)
      if (r?.error) toast.error(r.error)
      else toast.success('Informações salvas')
    })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pb-6 space-y-5">
      {/* ── Casal ──────────────────────────────────────────────────── */}
      <Section
        title="Casal"
        icon={<svg width="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.6-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7-.5C19 11.4 12 20 12 20Z"/></svg>}
      >
        <Field label="Noiva" registration={register('noiva')} />
        <Field label="Noivo" registration={register('noivo')} />
      </Section>

      {/* ── Evento ─────────────────────────────────────────────────── */}
      <Section
        title="Evento"
        icon={<svg width="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
      >
        <Field label="Data" type="date" registration={register('data_evento')} />
        <Field label="Horário" placeholder="ex: 18:00" registration={register('horario')} />
        <Field label="Local / Espaço" registration={register('local')} />
        <Field label="Endereço" registration={register('endereco')} />
        <Field label="Total de convidados" type="number" registration={register('total_convidados')} />
      </Section>

      {/* ── Mesas ──────────────────────────────────────────────────── */}
      <Section
        title="Mesas"
        icon={<svg width="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}
      >
        <Field label="Número de mesas" type="number" registration={register('total_mesas')} />
        <Field label="Capacidade por mesa" type="number" registration={register('capacidade_por_mesa')} />
      </Section>

      {/* ── Save button ─────────────────────────────────────────────── */}
      <div className="px-5">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-[14px] py-4 font-bold transition-opacity disabled:opacity-50"
          style={{ background: 'var(--terracotta)', color: '#fff', fontSize: 15 }}
        >
          {pending ? 'Salvando...' : 'Salvar informações'}
        </button>
      </div>

      {/* ── Conta ───────────────────────────────────────────────────── */}
      <Section
        title="Conta"
        icon={<svg width="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>}
      >
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-red-50"
          style={{ fontSize: 15, fontWeight: 600, color: '#B5564A' }}
        >
          <svg width="18" viewBox="0 0 24 24" fill="none" stroke="#B5564A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sair da conta
        </button>
      </Section>
    </form>
  )
}
