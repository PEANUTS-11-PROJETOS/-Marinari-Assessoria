'use client'
import { useState, useRef, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { atualizarConvidado } from '@/app/(dashboard)/casamentos/[id]/convidados/actions'
import type { Convidado } from '@/types'

// ── colour tints ──────────────────────────────────────────────────────────
const TINTS: [string, string][] = [
  ['#F9E4DD', '#9C4034'], ['#FEF3C2', '#A07A12'], ['#DCF5E9', '#2D6A4F'],
  ['#E8E3FF', '#4C3B9A'], ['#FFE8F0', '#9C2D57'], ['#E0F2F9', '#1C5E7E'],
]
function tint(name: string): [string, string] {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0xffffff
  return TINTS[Math.abs(h) % TINTS.length]
}
function ini(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

// ── geometry ──────────────────────────────────────────────────────────────
const TD = 160  // table diameter px
const SD = 34   // seat diameter px
const OR = TD / 2 - SD / 2 - 2  // orbit radius

function seatXY(i: number, n: number) {
  const a = (2 * Math.PI * i) / n - Math.PI / 2
  return { left: TD / 2 + OR * Math.cos(a) - SD / 2, top: TD / 2 + OR * Math.sin(a) - SD / 2 }
}

function getMesaFromPoint(x: number, y: number): string | null {
  const els = document.elementsFromPoint(x, y)
  for (const el of els) {
    let e: Element | null = el
    while (e) {
      const m = (e as HTMLElement).dataset?.mesa
      if (m) return m
      e = e.parentElement
    }
  }
  return null
}

// ── Round table ───────────────────────────────────────────────────────────
interface TableProps {
  mesaNum: string
  guests: Convidado[]
  capacidade: number
  onUnassign: (id: string) => void
}

function RoundTable({ mesaNum, guests, capacidade, onUnassign }: TableProps) {
  const seats = Math.max(capacidade, guests.length, 4)
  const full = guests.length >= capacidade
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        data-mesa={mesaNum}
        className="relative shrink-0 rounded-full"
        style={{
          width: TD, height: TD,
          background: full ? '#FFF0EB' : 'var(--blush-tint)',
          border: `2px ${full ? 'solid var(--terracotta)' : 'dashed var(--blush-soft)'}`,
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        {Array.from({ length: seats }).map((_, i) => {
          const g = guests[i]
          const pos = seatXY(i, seats)
          const [bg, fg] = g ? tint(g.nome) : ['transparent', 'var(--muted)']
          return (
            <div
              key={i}
              className="absolute flex items-center justify-center rounded-full select-none"
              style={{
                width: SD, height: SD, left: pos.left, top: pos.top,
                background: bg, color: fg,
                border: g ? 'none' : '1.5px dashed var(--line)',
                fontSize: 10, fontWeight: 700,
                cursor: g ? 'pointer' : 'default',
              }}
              onClick={() => g && onUnassign(g.id)}
              title={g ? `Remover ${g.nome}` : undefined}
            >
              {g ? ini(g.nome) : ''}
            </div>
          )
        })}
        {/* center */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif-display" style={{ fontSize: 24, color: 'var(--ink)', lineHeight: 1 }}>
            {mesaNum}
          </span>
          <span style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--muted-foreground)', marginTop: 2 }}>
            {guests.length}/{capacidade}
          </span>
        </div>
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)' }}>Mesa {mesaNum}</span>
    </div>
  )
}

// ── Guest chip (draggable) ────────────────────────────────────────────────
interface ChipProps {
  guest: Convidado
  onDragStart: (id: string, name: string, e: React.PointerEvent) => void
}

function GuestChip({ guest, onDragStart }: ChipProps) {
  const [bg, fg] = tint(guest.nome)
  return (
    <div
      className="flex shrink-0 cursor-grab items-center gap-2 rounded-full px-3 py-1.5 active:cursor-grabbing select-none"
      style={{ background: bg, color: fg, border: `1.5px solid ${fg}22`, touchAction: 'none' }}
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); onDragStart(guest.id, guest.nome, e) }}
    >
      <span style={{ fontSize: 11, fontWeight: 800 }}>{ini(guest.nome)}</span>
      <span style={{ fontSize: 12, fontWeight: 600, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {guest.nome.split(' ')[0]}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────
interface Props {
  casamentoId: string
  convidados: Convidado[]
  totalMesas: number | null
  capacidade: number | null
}

export function MesasView({ casamentoId, convidados, totalMesas, capacidade }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [local, setLocal] = useState<Record<string, string>>({})  // guestId → mesa ('' = unassigned)
  const [dragging, setDragging] = useState<{ id: string; name: string } | null>(null)
  const ghostRef = useRef<HTMLDivElement | null>(null)

  const cap = capacidade ?? 8
  const numMesas = totalMesas ?? 0

  // effective mesa for a guest
  const mesaDe = (g: Convidado) => (g.id in local ? local[g.id] : g.mesa) ?? ''

  const semMesa = convidados.filter(g => !mesaDe(g))
  const tables = Array.from({ length: numMesas }, (_, i) => {
    const num = String(i + 1)
    return { num, guests: convidados.filter(g => mesaDe(g) === num) }
  })

  // ── server sync ──────────────────────────────────────────────────────
  function syncMesa(guestId: string, mesa: string) {
    const g = convidados.find(x => x.id === guestId)!
    startTransition(async () => {
      const fd = new FormData()
      fd.set('nome', g.nome)
      fd.set('presenca', g.presenca)
      fd.set('mesa', mesa)
      const r = await atualizarConvidado(casamentoId, guestId, fd)
      if (r?.error) {
        toast.error(r.error)
        setLocal(prev => { const n = { ...prev }; delete n[guestId]; return n })
      } else {
        router.refresh()
      }
    })
  }

  function assign(guestId: string, mesa: string) {
    setLocal(prev => ({ ...prev, [guestId]: mesa }))
    syncMesa(guestId, mesa)
  }

  function unassign(guestId: string) {
    setLocal(prev => ({ ...prev, [guestId]: '' }))
    syncMesa(guestId, '')
  }

  // ── drag handlers (pointer capture approach) ─────────────────────────
  function startDrag(id: string, name: string, e: React.PointerEvent) {
    setDragging({ id, name })
    const ghost = document.createElement('div')
    const [bg, fg] = tint(name)
    ghost.style.cssText = `
      position:fixed;pointer-events:none;z-index:9999;
      padding:6px 14px;border-radius:999px;
      background:${bg};color:${fg};
      font-size:12px;font-weight:700;
      box-shadow:0 6px 18px rgba(0,0,0,0.18);
      transform:translate(-50%,-50%);
      transition:none;white-space:nowrap;
      left:${e.clientX}px;top:${e.clientY}px;
    `
    ghost.textContent = name.split(' ')[0]
    ghost.id = '__drag_ghost'
    document.body.appendChild(ghost)
    ghostRef.current = ghost
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || !ghostRef.current) return
    ghostRef.current.style.left = e.clientX + 'px'
    ghostRef.current.style.top = e.clientY + 'px'
    // highlight target table
    const mesa = getMesaFromPoint(e.clientX, e.clientY)
    document.querySelectorAll('[data-mesa]').forEach(el => {
      ;(el as HTMLElement).style.outline = ''
    })
    if (mesa) {
      const el = document.querySelector(`[data-mesa="${mesa}"]`) as HTMLElement | null
      if (el) el.style.outline = '3px solid var(--terracotta)'
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging) return
    document.querySelectorAll('[data-mesa]').forEach(el => { (el as HTMLElement).style.outline = '' })
    const mesa = getMesaFromPoint(e.clientX, e.clientY)
    if (mesa) assign(dragging.id, mesa)
    ghostRef.current?.remove()
    ghostRef.current = null
    setDragging(null)
  }

  // cleanup ghost on unmount
  useEffect(() => () => { ghostRef.current?.remove() }, [])

  if (numMesas === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-24 text-center gap-3">
        <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: 'var(--blush-tint)' }}>
          <svg width="30" viewBox="0 0 24 24" fill="none" stroke="var(--rosewood)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
        </div>
        <p className="font-serif-display text-2xl" style={{ color: 'var(--ink)' }}>Sem mesas</p>
        <p style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
          Defina o número de mesas e capacidade nas informações do casamento.
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: 0 }}
      onPointerMove={dragging ? handlePointerMove : undefined}
      onPointerUp={dragging ? handlePointerUp : undefined}
    >
      {/* ── header ─────────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <h1 className="font-serif-display" style={{ fontSize: 26, color: 'var(--ink)' }}>Mesas</h1>
        {semMesa.length > 0 && (
          <span className="rounded-full px-3 py-1" style={{ background: 'var(--blush-tint)', fontSize: 12, fontWeight: 700, color: 'var(--rosewood)' }}>
            {semMesa.length} sem mesa
          </span>
        )}
        {semMesa.length === 0 && convidados.length > 0 && (
          <span className="rounded-full px-3 py-1" style={{ background: '#DCF5E9', fontSize: 12, fontWeight: 700, color: '#2D6A4F' }}>
            Todos alocados ✓
          </span>
        )}
      </div>

      {/* ── tables grid ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 pb-2">
          {tables.map(({ num, guests }) => (
            <RoundTable
              key={num}
              mesaNum={num}
              guests={guests}
              capacidade={cap}
              onUnassign={unassign}
            />
          ))}
        </div>
      </div>

      {/* ── pool ────────────────────────────────────────────────────── */}
      {semMesa.length > 0 && (
        <div
          className="shrink-0"
          style={{
            background: 'var(--cream)',
            borderTop: '1px solid var(--line)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <p className="px-5 pt-3 pb-2" style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Arraste para alocar
          </p>
          <div className="flex gap-2 overflow-x-auto px-5 pb-3" style={{ scrollbarWidth: 'none' }}>
            {semMesa.map(g => (
              <GuestChip key={g.id} guest={g} onDragStart={startDrag} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
