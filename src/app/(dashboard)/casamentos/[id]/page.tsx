import { redirect } from 'next/navigation'

export default async function CasamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/casamentos/${id}/info`)
}
