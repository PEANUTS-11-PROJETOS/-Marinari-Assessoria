'use client'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { criarConvidado, atualizarConvidado } from '@/app/(dashboard)/casamentos/[id]/convidados/actions'
import type { Convidado } from '@/types'

const schema = z.object({
  nome:             z.string().trim().min(1, 'Nome obrigatório'),
  faixa_etaria:     z.string().trim(),
  contato_whatsapp: z.string().trim(),
  tipo:             z.string().trim(),
  mesa:             z.string().trim(),
  presenca:         z.enum(['confirmado', 'pendente', 'recusado']),
  observacao:       z.string().trim(),
})
type FormValues = z.infer<typeof schema>

interface Props { casamentoId: string; convidado?: Convidado; onSuccess: () => void }

export function FormConvidado({ casamentoId, convidado, onSuccess }: Props) {
  const [pending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome:             convidado?.nome ?? '',
      faixa_etaria:     convidado?.faixa_etaria ?? '',
      contato_whatsapp: convidado?.contato_whatsapp ?? '',
      tipo:             convidado?.tipo ?? '',
      mesa:             convidado?.mesa ?? '',
      presenca:         convidado?.presenca ?? 'pendente',
      observacao:       convidado?.observacao ?? '',
    },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const fd = new FormData()
      Object.entries(values).forEach(([k, v]) => fd.set(k, v))
      const result = convidado
        ? await atualizarConvidado(casamentoId, convidado.id, fd)
        : await criarConvidado(casamentoId, fd)
      if (result?.error) { toast.error(result.error); return }
      toast.success(convidado ? 'Convidado atualizado' : 'Convidado adicionado')
      onSuccess()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="nome" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Nome *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="faixa_etaria" render={({ field }) => (
            <FormItem>
              <FormLabel>Faixa etária</FormLabel>
              <FormControl><Input placeholder="Adulto / Criança" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="contato_whatsapp" render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp</FormLabel>
              <FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="tipo" render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl><Input placeholder="Família / Amigo" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="mesa" render={({ field }) => (
            <FormItem>
              <FormLabel>Mesa</FormLabel>
              <FormControl><Input placeholder="1, 2, VIP..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="presenca" render={({ field }) => (
            <FormItem>
              <FormLabel>Presença</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="recusado">Recusado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="observacao" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Observação</FormLabel>
              <FormControl><Textarea rows={2} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? 'Salvando...' : convidado ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
