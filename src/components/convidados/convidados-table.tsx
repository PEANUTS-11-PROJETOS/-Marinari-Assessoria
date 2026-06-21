'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { fmtData } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormConvidado } from './form-convidado'
import { ImportarConvidados } from './importar-convidados'
import { excluirConvidado } from '@/app/(dashboard)/casamentos/[id]/convidados/actions'
import { PRESENCA_LABELS } from '@/lib/utils'
import type { Convidado } from '@/types'

// Avatar com cor derivada do nome (hash)
const AVATAR_TINTS: [string, string][] = [
  ['#F4C2B0', '#8E3B2E'], ['#E8C7A8', '#8A5A2B'], ['#DCC3CE', '#7A4A66'],
  ['#C9D7C4', '#3F6147'], ['#CBD3E0', '#3C5273'], ['#F0CFA0', '#8A6326'],
]

function Avatar({ nome, size = 42 }: { nome: string; size?: number }) {
  let h = 0
  for (const c of nome) h = (h * 31 + c.charCodeAt(0)) % 6
  const [bg, fg] = AVATAR_TINTS[h]
  const parts = nome.trim().split(/\s+/)
  const inits = ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
  return (
    <div
      className="shrink-0 rounded-full flex items-center justify-center font-serif-display"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.38,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)' }}
    >
      {inits}
    </div>
  )
}

// Chip de presença fiel ao design
const PRESENCA_CHIP: Record<string, { bg: string; color: string; dot: string }> = {
  confirmado: { bg: 'rgba(94,140,106,0.14)',  color: '#46765A', dot: '#5E8C6A' },
  pendente:   { bg: 'rgba(201,154,75,0.16)',  color: '#9A7330', dot: '#C99A4B' },
  recusado:   { bg: 'rgba(181,86,74,0.14)',   color: '#9C4034', dot: '#B5564A' },
}

function StatusChip({ presenca }: { presenca: string }) {
  const s = PRESENCA_CHIP[presenca] ?? PRESENCA_CHIP.pendente
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full whitespace-nowrap"
      style={{ padding: '2px 9px', background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      <span className="rounded-full" style={{ width: 6, height: 6, background: s.dot }} />
      {PRESENCA_LABELS[presenca]}
    </span>
  )
}

function FilterChip({ label, active, onClick, dot }: { label: string; active: boolean; onClick: () => void; dot?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full whitespace-nowrap transition-colors shrink-0"
      style={{
        padding: '7px 13px',
        border: active ? '1px solid var(--terracotta)' : '1px solid var(--line)',
        background: active ? 'var(--terracotta)' : 'var(--ivory)',
        color: active ? '#fff' : 'var(--ink)',
        fontSize: 12.5, fontWeight: 600,
      }}
    >
      {dot && <span className="rounded-full" style={{ width: 7, height: 7, background: active ? '#fff' : dot }} />}
      {label}
    </button>
  )
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function buildWhatsAppUrl(numero: string, mensagem: string): string {
  const digits = numero.replace(/\D/g, '')
  const formatted = digits.startsWith('55') && digits.length >= 12 ? digits : '55' + digits
  return `https://wa.me/${formatted}?text=${encodeURIComponent(mensagem)}`
}

interface CasamentoInfo { noivo?: string | null; noiva?: string | null; data_evento?: string | null; local?: string | null }
interface Props { casamentoId: string; convidados: Convidado[]; casamento?: CasamentoInfo }

export function ConvidadosTable({ casamentoId, convidados, casamento }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busca, setBusca]       = useState('')
  const [fPres, setFPres]       = useState<string | null>(null)
  const [fTipo, setFTipo]       = useState<string | null>(null)
  const [editando, setEditando] = useState<Convidado | null | 'novo'>(null)

  const tipos = [...new Set(convidados.map(c => c.tipo).filter(Boolean))] as string[]

  const filtrados = convidados.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) &&
    (!fPres || c.presenca === fPres) &&
    (!fTipo || c.tipo === fTipo)
  )

  const stats = {
    total:      convidados.length,
    confirmado: convidados.filter(c => c.presenca === 'confirmado').length,
    pendente:   convidados.filter(c => c.presenca === 'pendente').length,
    recusado:   convidados.filter(c => c.presenca === 'recusado').length,
  }

  function handleExcluir(id: string) {
    if (!confirm('Excluir convidado?')) return
    startTransition(async () => {
      const r = await excluirConvidado(casamentoId, id)
      if (r?.error) toast.error(r.error)
      else { toast.success('Convidado excluído'); router.refresh() }
    })
  }

  return (
    <>
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',       value: stats.total,      dot: '' },
          { label: 'Confirmados', value: stats.confirmado, dot: '#5E8C6A' },
          { label: 'Pendentes',   value: stats.pendente,   dot: '#C99A4B' },
          { label: 'Recusados',   value: stats.recusado,   dot: '#B5564A' },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                {k.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: k.dot }} />}
                <span className="eyebrow">{k.label}</span>
              </div>
              <p className="font-serif-display text-3xl leading-none mt-1">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar: busca + botões */}
      <div className="flex gap-3 mb-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar convidado…" value={busca}
            onChange={e => setBusca(e.target.value)} className="pl-10" />
        </div>
        <ImportarConvidados casamentoId={casamentoId} />
        <Button onClick={() => setEditando('novo')}>
          <Plus className="mr-2 h-4 w-4" />Adicionar
        </Button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3" style={{ scrollbarWidth: 'none' }}>
        {(['confirmado', 'pendente', 'recusado'] as const).map(p => (
          <FilterChip key={p}
            label={PRESENCA_LABELS[p]}
            dot={PRESENCA_CHIP[p].dot}
            active={fPres === p}
            onClick={() => setFPres(fPres === p ? null : p)}
          />
        ))}
        {tipos.length > 0 && (
          <>
            <div className="w-px self-stretch mx-1" style={{ background: 'var(--line)' }} />
            {tipos.map(t => (
              <FilterChip key={t} label={t} active={fTipo === t} onClick={() => setFTipo(fTipo === t ? null : t)} />
            ))}
          </>
        )}
      </div>

      {/* Contador */}
      <p className="text-xs text-muted-foreground mb-3 px-1">
        {filtrados.length} {filtrados.length === 1 ? 'convidado' : 'convidados'}
      </p>

      {/* Lista de convidados — card com linhas */}
      <div className="rounded-[18px] bg-card overflow-hidden"
        style={{ boxShadow: '0 2px 10px rgba(142,59,46,0.05)', border: '1px solid var(--line)' }}>
        {filtrados.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Nenhum convidado encontrado.
          </div>
        )}
        {filtrados.map((c, i) => (
          <div key={c.id}>
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--blush-tint)]/40 transition-colors">
              <Avatar nome={c.nome} size={42} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-snug truncate" style={{ color: 'var(--ink)' }}>{c.nome}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {c.tipo && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--rose)' }}>{c.tipo}</span>
                  )}
                  {c.observacao && (
                    <span className="text-xs italic text-muted-foreground truncate">· {c.observacao}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <StatusChip presenca={c.presenca} />
                <span className="text-xs font-semibold"
                  style={{ color: c.mesa ? 'var(--ink)' : 'var(--muted-foreground)' }}>
                  {c.mesa ? `Mesa ${c.mesa}` : 'Sem mesa'}
                </span>
              </div>
              <div className="flex gap-0.5 ml-1">
                {c.contato_whatsapp && (() => {
                  const noivos = [casamento?.noiva, casamento?.noivo].filter(Boolean).join(' & ')
                  const data = casamento?.data_evento ? fmtData(casamento.data_evento) : ''
                  const local = casamento?.local ? ` em ${casamento.local}` : ''
                  const msg = `Olá, ${c.nome.split(' ')[0]}! 🌸 Passando para confirmar sua presença no casamento de ${noivos || 'nossos noivos'}${data ? ` no dia ${data}` : ''}${local}. Contamos com você! 💕`
                  return (
                    <a
                      href={buildWhatsAppUrl(c.contato_whatsapp, msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[#dcf5e0]"
                      style={{ color: '#25D366' }}
                      title="Enviar mensagem no WhatsApp"
                    >
                      <WhatsAppIcon size={15} />
                    </a>
                  )
                })()}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditando(c)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  disabled={pending} onClick={() => handleExcluir(c.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {i < filtrados.length - 1 && (
              <div className="h-px ml-[70px]" style={{ background: 'var(--line)' }} />
            )}
          </div>
        ))}
      </div>

      <Dialog open={editando !== null} onOpenChange={() => setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando === 'novo' ? 'Adicionar convidado' : 'Editar convidado'}</DialogTitle>
          </DialogHeader>
          {editando !== null && (
            <FormConvidado
              casamentoId={casamentoId}
              convidado={editando === 'novo' ? undefined : editando}
              onSuccess={() => { setEditando(null); router.refresh() }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
