'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Trash2, MapPin, Calendar, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { excluirCasamento } from '@/app/(dashboard)/casamentos/actions'
import { fmtData } from '@/lib/utils'
import type { Casamento } from '@/types'

function daysUntil(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(iso + 'T00:00:00').getTime() - today.getTime()) / 86400000)
}

function Monogram({ noivo, noiva }: { noivo: string; noiva: string }) {
  const a = (noiva || noivo || '?')[0].toUpperCase()
  const b = (noivo || noiva || '?')[0].toUpperCase()
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-white"
      style={{
        background: 'linear-gradient(150deg, var(--blush) 0%, var(--rose) 100%)',
        boxShadow: '0 3px 10px rgba(194,90,69,0.25)',
      }}
    >
      <span className="font-serif-display text-[18px] leading-none tracking-wide">
        {a}<span style={{ opacity: 0.7, fontStyle: 'italic', margin: '0 2px', fontSize: 14 }}>&</span>{b}
      </span>
    </div>
  )
}

export function CasamentosList({ casamentos }: { casamentos: Casamento[] }) {
  const [pending, startTransition] = useTransition()
  const [excluirId, setExcluirId] = useState<string | null>(null)

  function handleExcluir(id: string) {
    startTransition(async () => {
      const result = await excluirCasamento(id)
      setExcluirId(null)
      if (result?.error) toast.error(result.error)
      else toast.success('Casamento excluído')
    })
  }

  if (casamentos.length === 0) {
    return (
      <div
        className="rounded-[22px] py-14 text-center text-sm text-muted-foreground"
        style={{ border: '2px dashed var(--blush)', background: 'rgba(244,194,176,0.06)' }}
      >
        Nenhum casamento cadastrado ainda. Clique em &ldquo;Novo casamento&rdquo; para começar.
      </div>
    )
  }

  const ativos    = casamentos.filter(c => !c.data_evento || daysUntil(c.data_evento) >= 0)
  const concluidos = casamentos.filter(c => c.data_evento && daysUntil(c.data_evento) < 0)

  return (
    <>
      <div className="space-y-3">
        {ativos.length > 0 && (
          <section className="space-y-3">
            <p className="eyebrow px-1">Em andamento</p>
            {ativos.map(c => (
              <WeddingCard key={c.id} c={c} onExcluir={() => setExcluirId(c.id)} />
            ))}
          </section>
        )}
        {concluidos.length > 0 && (
          <section className="space-y-3 pt-4">
            <p className="eyebrow px-1">Concluídos</p>
            {concluidos.map(c => (
              <WeddingCard key={c.id} c={c} onExcluir={() => setExcluirId(c.id)} concluido />
            ))}
          </section>
        )}
      </div>

      <Dialog open={!!excluirId} onOpenChange={() => setExcluirId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir casamento?</DialogTitle>
            <DialogDescription>
              Todos os convidados, serviços financeiros e contratos serão excluídos permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExcluirId(null)}>Cancelar</Button>
            <Button variant="destructive" disabled={pending}
              onClick={() => excluirId && handleExcluir(excluirId)}>
              {pending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface CardProps { c: Casamento; onExcluir: () => void; concluido?: boolean }

function WeddingCard({ c, onExcluir, concluido = false }: CardProps) {
  const days = c.data_evento ? daysUntil(c.data_evento) : null

  return (
    <div
      className="relative rounded-[22px] bg-card px-4 py-4 overflow-hidden"
      style={{ boxShadow: '0 2px 10px rgba(142,59,46,0.06)', border: '1px solid var(--line)' }}
    >
      {/* Badge dias / concluído */}
      <div className="absolute top-4 right-4">
        {concluido ? (
          <div className="flex items-center gap-1.5 rounded-[14px] px-3 py-1.5 text-xs font-bold"
            style={{ background: 'rgba(94,140,106,0.12)', color: '#46765A' }}>
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Realizado
          </div>
        ) : days !== null ? (
          <div className="text-center rounded-[14px] px-3 py-1.5"
            style={{ background: 'var(--blush-tint)', color: 'var(--rosewood)' }}>
            <div className="font-serif-display text-2xl leading-none">{days}</div>
            <div className="eyebrow text-[9px] mt-0.5 text-center">{days === 1 ? 'dia' : 'dias'}</div>
          </div>
        ) : null}
      </div>

      {/* Nomes + monograma */}
      <Link href={`/casamentos/${c.id}/info`} className="flex items-center gap-3.5 pr-24">
        <Monogram noivo={c.noivo} noiva={c.noiva} />
        <div className="min-w-0">
          <p className="font-serif-display text-[21px] leading-snug" style={{ color: 'var(--ink)' }}>
            {c.noiva && (
              <>{c.noiva}<span style={{ color: 'var(--rose)', fontStyle: 'italic', margin: '0 4px' }}>&</span></>
            )}
            {c.noivo || (!c.noiva && 'Sem nome')}
          </p>
          {c.data_evento && (
            <div className="flex items-center gap-1.5 mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>{fmtData(c.data_evento)}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Local */}
      {c.local && (
        <div className="flex items-center gap-1.5 mt-2.5 pr-24" style={{ color: 'var(--muted-foreground)' }}>
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate" style={{ fontSize: 12.5, fontWeight: 500 }}>{c.local}</span>
        </div>
      )}

      {/* Mini-stat convidados */}
      {!!c.total_convidados && (
        <div className="mt-3 pt-3 flex gap-6" style={{ borderTop: '1px solid var(--line)' }}>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="eyebrow text-[10px]">Convidados</span>
              <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{c.total_convidados}</span>
            </div>
          </div>
        </div>
      )}

      {/* Excluir */}
      <button
        className="absolute bottom-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:text-destructive"
        style={{ color: 'var(--muted-foreground)' }}
        onClick={e => { e.preventDefault(); onExcluir() }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
