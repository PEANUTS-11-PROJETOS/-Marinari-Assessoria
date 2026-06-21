'use client'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { salvarInfo } from './actions'
import type { Casamento } from '@/types'

const schema = z.object({
  noivo:               z.string().trim(),
  noiva:               z.string().trim(),
  data_evento:         z.string().trim().optional(),
  horario:             z.string().trim().optional(),
  local:               z.string().trim().optional(),
  endereco:            z.string().trim().optional(),
  total_convidados:    z.string().trim().optional(),
})
type FormValues = z.infer<typeof schema>

export function InfoForm({ casamento }: { casamento: Casamento }) {
  const [pending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      noivo:               casamento.noivo ?? '',
      noiva:               casamento.noiva ?? '',
      data_evento:         casamento.data_evento ?? '',
      horario:             casamento.horario ?? '',
      local:               casamento.local ?? '',
      endereco:            casamento.endereco ?? '',
      total_convidados:    casamento.total_convidados?.toString() ?? '',
    },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const fd = new FormData()
      Object.entries(values).forEach(([k, v]) => { if (v) fd.set(k, v) })
      const result = await salvarInfo(casamento.id, fd)
      if (result?.error) toast.error(result.error)
      else toast.success('Informações salvas')
    })
  }

  const Field = ({ name, label, type = 'text' }: { name: keyof FormValues; label: string; type?: string }) => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl><Input type={type} {...field} value={field.value ?? ''} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-6 grid gap-4 sm:grid-cols-2">
            <Field name="noivo" label="Nome do noivo" />
            <Field name="noiva" label="Nome da noiva" />
            <Field name="data_evento" label="Data do evento" type="date" />
            <Field name="horario" label="Horário" />
            <Field name="local" label="Local / Espaço" />
            <Field name="endereco" label="Endereço" />
            <Field name="total_convidados" label="Total de convidados" type="number" />
          </CardContent>
        </Card>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={pending}>{pending ? 'Salvando...' : 'Salvar informações'}</Button>
        </div>
      </form>
    </Form>
  )
}
