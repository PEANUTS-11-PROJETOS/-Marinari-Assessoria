import Link from 'next/link'
import { fmtMoeda, fmtData } from '@/lib/utils'
import type { Casamento } from '@/types'

interface Stats {
  total: number
  confirmados: number
  semMesa: number
  pagoPct: number
  totalPago: number
  totalGeral: number
  dias: number | null
}

interface Props {
  casamentoId: string
  casamento: Casamento
  stats: Stats
}

// SVG progress ring
function Ring({
  value, size = 36, stroke = 4, color = 'var(--terracotta)',
}: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.max(0, Math.min(1, value)))
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--blush-soft)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={offset}
        strokeLinecap="round" />
    </svg>
  )
}

function StatCard({
  icon, label, big, sub, color = 'var(--terracotta)', ring, href,
}: {
  icon: React.ReactNode; label: string; big: string; sub: string
  color?: string; ring: number; href: string
}) {
  return (
    <Link href={href}
      className="flex flex-col gap-2.5 rounded-[20px] bg-card p-4 transition-colors hover:brightness-[0.98]"
      style={{ boxShadow: '0 2px 10px rgba(142,59,46,0.05)', border: '1px solid var(--line)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px]"
          style={{ background: 'var(--blush-tint)', color: 'var(--rosewood)' }}>
          {icon}
        </div>
        <Ring value={ring} color={color} />
      </div>
      <div>
        <p className="font-serif-display leading-none" style={{ fontSize: 30, color: 'var(--ink)' }}>{big}</p>
        <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginTop: 2 }}>{sub}</p>
      </div>
      <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>{label}</p>
    </Link>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
        style={{ background: 'var(--blush-tint)', color: 'var(--rosewood)' }}>
        {icon}
      </div>
      <div className="pt-0.5">
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginTop: 1 }}>{value}</p>
      </div>
    </div>
  )
}

export function DashB({ casamentoId, casamento, stats }: Props) {
  const { total, confirmados, semMesa, pagoPct, totalPago, totalGeral, dias } = stats
  const noivos = [casamento.noiva, casamento.noivo].filter(Boolean)

  return (
    <div className="px-5 pb-6 space-y-4">
      {/* ── Hero card salmão ─────────────────────────────────── */}
      <div
        className="rounded-[24px] p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #F7D3C4 0%, #E9A98F 55%, #D98E78 100%)',
          boxShadow: '0 8px 22px rgba(194,90,69,0.22)', color: '#fff',
        }}
      >
        {/* Coração decorativo */}
        <svg className="pointer-events-none absolute right-[-20px] top-[-20px]"
          width="150" height="150" viewBox="0 0 24 24" style={{ opacity: 0.2 }}>
          <path d="M12 20s-7-4.6-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7-.5C19 11.4 12 20 12 20Z"
            fill="white" />
        </svg>

        <div className="relative">
          {/* Monograma */}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-white"
            style={{
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(6px)',
              fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 18,
            }}
          >
            {(casamento.noiva || casamento.noivo || '?')[0].toUpperCase()}
            <span style={{ opacity: 0.7, fontStyle: 'italic', margin: '0 1px', fontSize: 14 }}>&</span>
            {(casamento.noivo || casamento.noiva || '?')[0].toUpperCase()}
          </div>

          {/* Nomes */}
          <h2 className="font-serif-display mt-3.5" style={{ fontSize: 30, lineHeight: 1.05 }}>
            {noivos[0]}
            {noivos[1] && (
              <> <span style={{ fontStyle: 'italic', opacity: 0.85 }}>&</span> {noivos[1]}</>
            )}
          </h2>

          {/* Data + hora */}
          {casamento.data_evento && (
            <div className="mt-2 flex items-center gap-1.5" style={{ opacity: 0.95 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {fmtData(casamento.data_evento)}
                {casamento.horario && ` · ${/^\d{1,2}$/.test(casamento.horario.trim()) ? casamento.horario + 'h' : casamento.horario}`}
              </span>
            </div>
          )}

          {/* Pílula dias */}
          {dias !== null && (
            <div
              className="mt-4 inline-flex items-center gap-2"
              style={{
                background: 'rgba(255,255,255,0.22)',
                backdropFilter: 'blur(6px)',
                borderRadius: 999, padding: '7px 14px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {dias > 0 ? `Faltam ${dias} ${dias === 1 ? 'dia' : 'dias'}` : dias === 0 ? 'É hoje! ✦' : 'Realizado'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Grid 2×2 stat cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<svg width="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM20 19v-1.4a3.5 3.5 0 0 0-2.6-3.4M15.5 4.2a3.5 3.5 0 0 1 0 6.6"/></svg>}
          label="Confirmados"
          big={String(confirmados)}
          sub={`de ${total} convidados`}
          ring={total > 0 ? confirmados / total : 0}
          href={`/casamentos/${casamentoId}/convidados`}
        />
        <StatCard
          icon={<svg width="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M16.5 6.5C16 4.8 14.2 4 12 4 9.2 4 7.5 5.4 7.5 7.4c0 4.8 9.5 2.6 9.5 7.5 0 2.1-1.9 3.6-5 3.6-2.6 0-4.6-1-5.2-2.9"/></svg>}
          label="Pago"
          big={`${pagoPct}%`}
          sub={fmtMoeda(totalPago)}
          color="var(--gold)"
          ring={totalGeral > 0 ? totalPago / totalGeral : 0}
          href={`/casamentos/${casamentoId}/financeiro`}
        />
        <StatCard
          icon={<svg width="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}
          label="Mesas"
          big={casamento.total_mesas != null ? String(casamento.total_mesas) : '—'}
          sub={semMesa > 0 ? `${semMesa} sem mesa` : 'todos alocados'}
          ring={total > 0 && semMesa < total ? (total - semMesa) / total : 0}
          href={`/casamentos/${casamentoId}/mesas`}
        />
        <StatCard
          icon={<svg width="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5ZM14 3v5h5M9 13h6M9 17h6"/></svg>}
          label="Financeiro"
          big={totalGeral > 0 ? `${pagoPct}%` : '—'}
          sub={totalGeral > 0 ? `de ${fmtMoeda(totalGeral)}` : 'sem serviços'}
          color="var(--rose)"
          ring={totalGeral > 0 ? pagoPct / 100 : 0}
          href={`/casamentos/${casamentoId}/financeiro`}
        />
      </div>

      {/* ── Detalhes do evento ───────────────────────────────── */}
      {(casamento.data_evento || casamento.local || casamento.endereco) && (
        <div className="rounded-[20px] bg-card p-4 space-y-3.5"
          style={{ boxShadow: '0 2px 10px rgba(142,59,46,0.05)', border: '1px solid var(--line)' }}>
          <p className="eyebrow">Detalhes do evento</p>
          {casamento.data_evento && (
            <InfoRow
              icon={<svg width="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
              label="Data e horário"
              value={`${fmtData(casamento.data_evento)}${casamento.horario ? ' · ' + (/^\d{1,2}$/.test(casamento.horario.trim()) ? casamento.horario + 'h' : casamento.horario) : ''}`}
            />
          )}
          {casamento.local && (
            <InfoRow
              icon={<svg width="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg>}
              label="Local"
              value={casamento.local}
            />
          )}
          {casamento.endereco && (
            <InfoRow
              icon={<svg width="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></svg>}
              label="Endereço"
              value={casamento.endereco}
            />
          )}
        </div>
      )}
    </div>
  )
}
