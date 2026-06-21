'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormServico } from './form-servico'
import { ContratosSection } from '@/components/contratos/contratos-section'
import { excluirServico } from '@/app/(dashboard)/casamentos/[id]/financeiro/actions'
import { fmtMoeda } from '@/lib/utils'
import type { ServicoFinanceiro, Contrato } from '@/types'

type ServicoComContratos = ServicoFinanceiro & { contratos: Contrato[] }
interface Props { casamentoId: string; servicos: ServicoComContratos[] }

function ProgressBar({ value, color, track = 'var(--blush-soft)', h = 6 }: {
  value: number; color: string; track?: string; h?: number
}) {
  return (
    <div style={{ height: h, borderRadius: 999, background: track, overflow: 'hidden', width: '100%' }}>
      <div style={{
        height: '100%',
        width: `${Math.max(0, Math.min(100, value * 100))}%`,
        background: color, borderRadius: 999,
        transition: 'width .5s cubic-bezier(.4,0,.2,1)',
      }} />
    </div>
  )
}

export function ServicosTable({ casamentoId, servicos }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editando, setEditando]   = useState<ServicoFinanceiro | null | 'novo'>(null)
  const [expandido, setExpandido] = useState<string | null>(null)

  const totalGeral  = servicos.reduce((s, v) => s + Number(v.total), 0)
  const totalPago   = servicos.reduce((s, v) => s + Number(v.pago),  0)
  const totalAberto = totalGeral - totalPago
  const pct = totalGeral ? totalPago / totalGeral : 0

  function handleExcluir(id: string) {
    if (!confirm('Excluir serviço e todos os contratos vinculados?')) return
    startTransition(async () => {
      const r = await excluirServico(casamentoId, id)
      if (r?.error) toast.error(r.error)
      else { toast.success('Serviço excluído'); router.refresh() }
    })
  }

  return (
    <>
      {/* Hero card financeiro — gradiente escuro com anel decorativo */}
      <div className="rounded-[22px] p-5 mb-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #B05744 0%, #8E3B2E 100%)',
          boxShadow: '0 8px 22px rgba(142,59,46,0.28)' }}>
        <svg className="absolute right-[-16px] bottom-[-24px] pointer-events-none"
          width="130" height="130" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.12 }}>
          <path d="M12 8a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM9 6l3-3 3 3-3 2.2L9 6Z"
            stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="relative">
          <p style={{ fontSize: 12, fontWeight: 600, opacity: 0.85, letterSpacing: 0.5 }}>Total contratado</p>
          <p className="font-serif-display leading-tight mt-1" style={{ fontSize: 38 }}>{fmtMoeda(totalGeral)}</p>
          <div className="mt-4">
            <ProgressBar value={pct} color="#F4C2B0" track="rgba(255,255,255,0.22)" h={8} />
          </div>
          <div className="flex justify-between mt-3">
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pago</p>
              <p style={{ fontSize: 16, fontWeight: 800 }}>{fmtMoeda(totalPago)}</p>
            </div>
            <div className="text-right">
              <p style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>A pagar</p>
              <p style={{ fontSize: 16, fontWeight: 800 }}>{fmtMoeda(totalAberto)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header serviços */}
      <div className="flex items-center justify-between mb-4">
        <p className="eyebrow">Serviços</p>
        <Button onClick={() => setEditando('novo')}>
          <Plus className="mr-2 h-4 w-4" />Adicionar serviço
        </Button>
      </div>

      {/* Cards de serviço */}
      <div className="flex flex-col gap-3">
        {servicos.length === 0 && (
          <div className="rounded-[18px] py-12 text-center text-sm text-muted-foreground"
            style={{ border: '2px dashed var(--blush)', background: 'rgba(244,194,176,0.06)' }}>
            Nenhum serviço cadastrado.
          </div>
        )}
        {servicos.map(s => {
          const p = Number(s.total) ? Number(s.pago) / Number(s.total) : 0
          const quitado = Number(s.pago) >= Number(s.total) && Number(s.total) > 0
          const exp = expandido === s.id

          return (
            <div key={s.id} className="rounded-[18px] bg-card overflow-hidden"
              style={{ boxShadow: '0 2px 10px rgba(142,59,46,0.05)', border: '1px solid var(--line)' }}>
              <div className="px-4 pt-4 pb-3">
                {/* Cabeçalho do serviço */}
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{s.nome}</p>
                  {quitado ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{ background: 'rgba(94,140,106,0.14)', color: '#46765A' }}>
                      <Check className="h-3 w-3" strokeWidth={2.6} />Quitado
                    </span>
                  ) : (
                    <span className="text-xs font-bold" style={{ color: 'var(--terracotta)' }}>
                      {Math.round(p * 100)}%
                    </span>
                  )}
                </div>
                {/* Barra de progresso */}
                <ProgressBar value={p} color={quitado ? '#5E8C6A' : 'var(--terracotta)'} h={6} />
                {/* Valores */}
                <div className="flex justify-between mt-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {fmtMoeda(Number(s.pago))} pagos
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>
                    de {fmtMoeda(Number(s.total))}
                  </span>
                </div>
              </div>

              {/* Footer: contratos toggle + ações */}
              <div className="flex items-center gap-2 px-4 pb-3"
                style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                <button
                  onClick={() => setExpandido(exp ? null : s.id)}
                  className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                  style={{ color: exp ? 'var(--terracotta)' : 'var(--muted-foreground)' }}
                >
                  {exp
                    ? <ChevronDown className="h-3.5 w-3.5" />
                    : <ChevronRight className="h-3.5 w-3.5" />}
                  Contratos
                  {s.contratos.length > 0 && (
                    <span className="ml-0.5 rounded-full px-1.5 py-0 text-[10px] font-bold"
                      style={{ background: 'var(--blush-tint)', color: 'var(--rosewood)' }}>
                      {s.contratos.length}
                    </span>
                  )}
                </button>
                <div className="flex-1" />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditando(s)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  disabled={pending} onClick={() => handleExcluir(s.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {exp && (
                <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--line)' }}>
                  <ContratosSection casamentoId={casamentoId} servicoId={s.id} contratos={s.contratos} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Dialog open={editando !== null} onOpenChange={() => setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando === 'novo' ? 'Adicionar serviço' : 'Editar serviço'}</DialogTitle>
          </DialogHeader>
          {editando !== null && (
            <FormServico
              casamentoId={casamentoId}
              servico={editando === 'novo' ? undefined : editando}
              onSuccess={() => { setEditando(null); router.refresh() }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
