'use client'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, FileText, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import type { Contrato } from '@/types'

interface Props { casamentoId: string; servicoId: string; contratos: Contrato[] }

export function ContratosSection({ casamentoId, servicoId, contratos }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading]  = useState(false)
  const [pending, startTransition] = useTransition()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.set('arquivo', file)
    fd.set('casamento_id', casamentoId)
    fd.set('servico_id', servicoId)
    const res = await fetch('/api/contratos', { method: 'POST', body: fd })
    const json = await res.json()
    setUploading(false)
    if (json.error) { toast.error(json.error); return }
    toast.success('Arquivo enviado')
    router.refresh()
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDownload(c: Contrato) {
    const { data } = await supabase.storage.from('contratos').createSignedUrl(c.storage_path, 60)
    if (!data?.signedUrl) { toast.error('Erro ao gerar link'); return }
    window.open(data.signedUrl, '_blank')
  }

  function handleExcluir(c: Contrato) {
    if (!confirm(`Excluir "${c.nome_arquivo}"?`)) return
    startTransition(async () => {
      const res = await fetch('/api/contratos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contratoId: c.id, storagePath: c.storage_path }),
      })
      const json = await res.json()
      if (json.error) { toast.error(json.error); return }
      toast.success('Arquivo excluído')
      router.refresh()
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Contratos ({contratos.length})
        </p>
        <Button variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          {uploading ? 'Enviando...' : 'Enviar arquivo'}
        </Button>
        <input ref={inputRef} type="file" className="hidden" onChange={handleUpload}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
      </div>
      {contratos.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum arquivo enviado.</p>
      ) : (
        <div className="space-y-1.5">
          {contratos.map(c => (
            <div key={c.id} className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <FileText className="h-4 w-4 text-muted-foreground flex-none" />
              <span className="text-sm flex-1 truncate">{c.nome_arquivo}</span>
              {c.tamanho && (
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {(c.tamanho / 1024).toFixed(0)} KB
                </span>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(c)}>
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                disabled={pending} onClick={() => handleExcluir(c)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
