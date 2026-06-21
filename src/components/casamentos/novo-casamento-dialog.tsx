'use client'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { criarCasamento } from '@/app/(dashboard)/casamentos/actions'

const schema = z.object({
  noivo: z.string().trim(),
  noiva: z.string().trim(),
}).refine(d => d.noivo || d.noiva, { message: 'Informe ao menos um dos noivos', path: ['noivo'] })
type FormValues = z.infer<typeof schema>

export function NovoCasamentoDialog() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { noivo: '', noiva: '' },
  })

  function onSubmit(values: FormValues) {
    setErro(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('noivo', values.noivo)
      fd.set('noiva', values.noiva)
      const result = await criarCasamento(fd)
      if (result?.error) { setErro(result.error); return }
      setOpen(false)
      form.reset()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />Novo casamento
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo casamento</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField control={form.control} name="noivo" render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do noivo</FormLabel>
                <FormControl><Input placeholder="João Silva" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="noiva" render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da noiva</FormLabel>
                <FormControl><Input placeholder="Maria Santos" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={pending}>{pending ? 'Criando...' : 'Criar casamento'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
