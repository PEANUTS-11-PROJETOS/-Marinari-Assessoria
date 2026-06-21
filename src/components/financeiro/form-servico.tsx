'use client'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { criarServico, atualizarServico } from '@/app/(dashboard)/casamentos/[id]/financeiro/actions'
import type { ServicoFinanceiro } from '@/types'

const schema = z.object({
  nome:  z.string().trim().min(1, 'Nome obrigatório'),
  total: z.string().trim(),
  pago:  z.string().trim(),
})
type FormValues = z.infer<typeof schema>

interface Props { casamentoId: string; servico?: ServicoFinanceiro; onSuccess: () => void }

export function FormServico({ casamentoId, servico, onSuccess }: Props) {
  const [pending, startTransition] = useTransition()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: servico?.nome ?? '', total: String(servico?.total ?? 0), pago: String(servico?.pago ?? 0) },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const fd = new FormData()
      Object.entries(values).forEach(([k, v]) => fd.set(k, String(v)))
      const result = servico
        ? await atualizarServico(casamentoId, servico.id, fd)
        : await criarServico(casamentoId, fd)
      if (result?.error) { toast.error(result.error); return }
      toast.success(servico ? 'Serviço atualizado' : 'Serviço adicionado')
      onSuccess()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="nome" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do serviço *</FormLabel>
            <FormControl><Input placeholder="Buffet, Fotografia, Decoração..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="total" render={({ field }) => (
            <FormItem>
              <FormLabel>Valor total (R$)</FormLabel>
              <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="pago" render={({ field }) => (
            <FormItem>
              <FormLabel>Valor pago (R$)</FormLabel>
              <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? 'Salvando...' : servico ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
