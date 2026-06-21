'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmar: z.string(),
}).refine(d => d.senha === d.confirmar, {
  message: 'As senhas não coincidem',
  path: ['confirmar'],
})
type FormValues = z.infer<typeof schema>

export function CadastroForm() {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', senha: '', confirmar: '' },
  })

  async function onSubmit({ email, senha }: FormValues) {
    setErro(null)
    const { error } = await supabase.auth.signUp({ email, password: senha })
    if (error) {
      if (error.message.includes('already registered')) {
        setErro('Este email já está cadastrado.')
      } else {
        setErro(error.message)
      }
      return
    }
    router.push('/casamentos')
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="senha" render={({ field }) => (
          <FormItem>
            <FormLabel>Senha</FormLabel>
            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="confirmar" render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmar senha</FormLabel>
            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </form>
    </Form>
  )
}
