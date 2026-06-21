'use client'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, FileSpreadsheet, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { inserirConvidadosImportados } from '@/app/(dashboard)/casamentos/[id]/convidados/import-actions'
import type { ConvidadoImportado } from '@/app/api/importar-convidados/route'

const PRESENCA_COR: Record<string, string> = {
  confirmado: 'bg-[var(--success)]/10 text-[var(--success)] border-transparent',
  pendente:   'bg-[var(--warning)]/10 text-[var(--warning-foreground)] border-transparent',
  recusado:   'bg-destructive/10 text-destructive border-transparent',
}
const PRESENCA_LABEL: Record<string, string> = {
  confirmado: 'Confirmado',
  pendente:   'Pendente',
  recusado:   'Recusado',
}

interface Props { casamentoId: string }

export function ImportarConvidados({ casamentoId }: Props) {
  const router   = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [parsing, setParsing]   = useState(false)
  const [preview, setPreview]   = useState<ConvidadoImportado[] | null>(null)
  const [pending, startTransition] = useTransition()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (inputRef.current) inputRef.current.value = ''

    setParsing(true)
    const fd = new FormData()
    fd.set('arquivo', file)

    const res  = await fetch('/api/importar-convidados', { method: 'POST', body: fd })
    const json = await res.json()
    setParsing(false)

    if (json.error) { toast.error(json.error); return }
    if (!json.convidados?.length) { toast.warning('Nenhum convidado encontrado na planilha'); return }
    setPreview(json.convidados)
  }

  function handleConfirmar() {
    if (!preview) return
    startTransition(async () => {
      const result = await inserirConvidadosImportados(casamentoId, preview)
      if (result.error) { toast.error(result.error); return }
      toast.success(`${result.importados} convidados importados com sucesso`)
      setPreview(null)
      router.refresh()
    })
  }

  return (
    <>
      <Button
        variant="outline"
        disabled={parsing}
        onClick={() => inputRef.current?.click()}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        {parsing ? 'Lendo planilha...' : 'Importar Excel'}
      </Button>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".xlsx,.xls"
        onChange={handleFile}
      />

      {/* Dialog de preview */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Preview — {preview?.length ?? 0} convidados encontrados
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Faixa etária</TableHead>
                  <TableHead className="hidden md:table-cell">WhatsApp</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Presença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview?.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{c.faixa_etaria || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm">{c.contato_whatsapp || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{c.tipo || '—'}</TableCell>
                    <TableCell>{c.mesa || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={PRESENCA_COR[c.presenca]}>
                        {PRESENCA_LABEL[c.presenca]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={() => setPreview(null)}>
              <X className="mr-2 h-4 w-4" />Cancelar
            </Button>
            <Button onClick={handleConfirmar} disabled={pending}>
              <Check className="mr-2 h-4 w-4" />
              {pending ? 'Importando...' : `Importar ${preview?.length ?? 0} convidados`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
