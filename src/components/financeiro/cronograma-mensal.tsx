'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fmtMoeda } from '@/lib/utils'
import { salvarParcela, excluirParcela, toggleParcela } from '@/app/(dashboard)/casamentos/[id]/financeiro/parcelas-actions'
import type { ParcelaMensal, ServicoFinanceiro } from '@/types'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)',
  textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 14, fontWeight: 500,
  color: 'var(--ink)', background: 'var(--cream)', border: '1px solid var(--line)', outline: 'none',
}

interface FormState {
  descricao: string
  valor: string
  mes: string
  servico_id: string
}

function FormParcela({
  initial, servicos, onSave, onCancel, pending,
}: {
  initial: FormState
  servicos: ServicoFinanceiro[]
  onSave: (fd: FormData) => void
  onCancel: () => void
  pending: boolean
}) {
  const [form, setForm] = useState(initial)

  function setField(k: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))
  }

  function handleServicoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    setForm(f => {
      const servico = servicos.find(s => s.id === id)
      return {
        ...f,
        servico_id: id,
        // pré-preenche descrição só se ainda estava vazia ou igual ao serviço anterior
        descricao: servico && (f.descricao === '' || servicos.some(s => s.nome === f.descricao))
          ? servico.nome
          : f.descricao,
      }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('descricao', form.descricao)
    fd.set('valor', form.valor)
    fd.set('data_vencimento', form.mes)
    if (form.servico_id) fd.set('servico_id', form.servico_id)
    onSave(fd)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {/* Serviço vinculado */}
      {servicos.length > 0 && (
        <div>
          <label style={labelStyle}>Serviço vinculado</label>
          <select style={inputStyle} value={form.servico_id} onChange={handleServicoChange}>
            <option value="">— Nenhum —</option>
            {servicos.map(s => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
          {form.servico_id && (
            <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>
              ✦ Ao marcar como pago, o valor pago do serviço será atualizado automaticamente.
            </p>
          )}
        </div>
      )}

      {/* Descrição */}
      <div>
        <label style={labelStyle}>Descrição</label>
        <input style={inputStyle} placeholder="ex: Buffet — 1ª parcela"
          value={form.descricao} onChange={setField('descricao')} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Valor (R$)</label>
          <input style={inputStyle} type="number" min="0" step="0.01" placeholder="0,00"
            value={form.valor} onChange={setField('valor')} required />
        </div>
        <div>
          <label style={labelStyle}>Mês</label>
          <input style={inputStyle} type="month"
            value={form.mes} onChange={setField('mes')} required />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={pending}>{pending ? 'Salvando…' : 'Salvar'}</Button>
      </div>
    </form>
  )
}

interface Props {
  casamentoId: string
  parcelas: ParcelaMensal[]
  servicos: ServicoFinanceiro[]
  anoReferencia?: number
}

export function CronogramaFinanceiro({ casamentoId, parcelas, servicos, anoReferencia }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editando, setEditando] = useState<ParcelaMensal | 'novo' | null>(null)

  const servicoMap = Object.fromEntries(servicos.map(s => [s.id, s.nome]))

  const defaultMes = anoReferencia
    ? `${anoReferencia}-01`
    : new Date().toISOString().slice(0, 7)

  const grupos = parcelas.reduce<Record<string, ParcelaMensal[]>>((acc, p) => {
    const chave = p.data_vencimento.slice(0, 7)
    ;(acc[chave] ??= []).push(p)
    return acc
  }, {})

  const mesesOrdenados = Object.keys(grupos).sort()

  function mesLabel(chave: string) {
    const [ano, mes] = chave.split('-')
    return `${MESES[parseInt(mes) - 1]} ${ano}`
  }

  function totalMes(lista: ParcelaMensal[]) {
    return lista.reduce((s, p) => s + Number(p.valor), 0)
  }

  function totalPagoMes(lista: ParcelaMensal[]) {
    return lista.filter(p => p.pago).reduce((s, p) => s + Number(p.valor), 0)
  }

  function handleSalvar(fd: FormData) {
    const id = editando !== 'novo' && editando ? editando.id : null
    startTransition(async () => {
      const r = await salvarParcela(casamentoId, id, fd)
      if (r?.error) { toast.error(r.error); return }
      toast.success(id ? 'Parcela atualizada' : 'Parcela adicionada')
      setEditando(null)
      router.refresh()
    })
  }

  function handleExcluir(p: ParcelaMensal) {
    if (!confirm(`Excluir "${p.descricao}"?`)) return
    startTransition(async () => {
      const r = await excluirParcela(casamentoId, p.id)
      if (r?.error) toast.error(r.error)
      else { toast.success('Removido'); router.refresh() }
    })
  }

  function handleToggle(p: ParcelaMensal) {
    startTransition(async () => {
      const r = await toggleParcela(casamentoId, p.id, !p.pago)
      if (r?.error) toast.error(r.error)
      else router.refresh()
    })
  }

  const initialForm: FormState = editando && editando !== 'novo'
    ? {
        descricao: editando.descricao,
        valor: String(editando.valor),
        mes: editando.data_vencimento.slice(0, 7),
        servico_id: editando.servico_id ?? '',
      }
    : { descricao: '', valor: '', mes: defaultMes, servico_id: '' }

  const totalGeral = parcelas.reduce((s, p) => s + Number(p.valor), 0)
  const totalPago  = parcelas.filter(p => p.pago).reduce((s, p) => s + Number(p.valor), 0)

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Cronograma mensal</h2>
          {totalGeral > 0 && (
            <p style={{ fontSize: 12.5, color: 'var(--muted-foreground)', marginTop: 2 }}>
              {fmtMoeda(totalPago)} pagos de {fmtMoeda(totalGeral)}
            </p>
          )}
        </div>
        <Button size="sm" onClick={() => setEditando('novo')}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />Adicionar
        </Button>
      </div>

      {mesesOrdenados.length === 0 ? (
        <div
          className="rounded-[18px] py-12 text-center"
          style={{ border: '1.5px dashed var(--line)', color: 'var(--muted-foreground)', fontSize: 14 }}
        >
          Nenhum pagamento planejado ainda.
          <br />
          <button
            className="mt-2 font-semibold underline-offset-2 hover:underline"
            style={{ color: 'var(--terracotta)', fontSize: 13 }}
            onClick={() => setEditando('novo')}
          >
            Adicionar primeiro pagamento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {mesesOrdenados.map(chave => {
            const lista = grupos[chave]
            const total  = totalMes(lista)
            const pago   = totalPagoMes(lista)
            const quitado = pago >= total

            return (
              <div key={chave} className="rounded-[18px] overflow-hidden"
                style={{ border: '1px solid var(--line)', boxShadow: '0 2px 10px rgba(142,59,46,0.05)' }}>

                {/* Cabeçalho do mês */}
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ background: quitado ? 'rgba(94,140,106,0.08)' : 'var(--blush-tint)' }}>
                  <div className="flex items-center gap-2">
                    {quitado && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ background: '#5E8C6A' }}>
                        <Check size={11} color="white" strokeWidth={2.5} />
                      </div>
                    )}
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: quitado ? '#46765A' : 'var(--ink)',
                      textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>
                      {mesLabel(chave)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif-display"
                      style={{ fontSize: 18, color: quitado ? '#46765A' : 'var(--ink)' }}>
                      {fmtMoeda(total)}
                    </span>
                    {!quitado && pago > 0 && (
                      <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 1 }}>
                        {fmtMoeda(pago)} pagos
                      </p>
                    )}
                  </div>
                </div>

                {/* Linhas */}
                <div className="bg-card divide-y" style={{ borderTop: '1px solid var(--line)' }}>
                  {lista.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3 group">
                      {/* Toggle pago */}
                      <button
                        onClick={() => handleToggle(p)}
                        disabled={pending}
                        className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
                        style={{
                          borderColor: p.pago ? '#5E8C6A' : 'var(--line)',
                          background:  p.pago ? '#5E8C6A' : 'transparent',
                        }}
                      >
                        {p.pago && <Check size={10} color="white" strokeWidth={3} />}
                      </button>

                      {/* Descrição + badge serviço */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate"
                          style={{
                            fontWeight: 500,
                            color: p.pago ? 'var(--muted-foreground)' : 'var(--ink)',
                            textDecoration: p.pago ? 'line-through' : 'none',
                          }}>
                          {p.descricao}
                        </p>
                        {p.servico_id && servicoMap[p.servico_id] && (
                          <span className="inline-flex items-center gap-1 mt-0.5"
                            style={{
                              fontSize: 10.5, fontWeight: 600,
                              color: 'var(--terracotta)',
                              background: 'var(--blush-tint)',
                              borderRadius: 999, padding: '1px 7px',
                            }}>
                            ↳ {servicoMap[p.servico_id]}
                          </span>
                        )}
                      </div>

                      {/* Valor */}
                      <span className="font-serif-display shrink-0"
                        style={{ fontSize: 16, color: p.pago ? 'var(--muted-foreground)' : 'var(--ink)' }}>
                        {fmtMoeda(Number(p.valor))}
                      </span>

                      {/* Ações */}
                      <div className="flex gap-0.5 shrink-0">
                        <Button variant="ghost" size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setEditando(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          disabled={pending} onClick={() => handleExcluir(p)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={editando !== null} onOpenChange={v => { if (!v) setEditando(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando === 'novo' ? 'Novo pagamento' : 'Editar pagamento'}
            </DialogTitle>
          </DialogHeader>
          {editando !== null && (
            <FormParcela
              initial={initialForm}
              servicos={servicos}
              onSave={handleSalvar}
              onCancel={() => setEditando(null)}
              pending={pending}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
