'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function toggleBloqueio(userId: string, bloquear: boolean) {
  const admin = createAdminClient()
  await admin.auth.admin.updateUserById(userId, {
    ban_duration: bloquear ? '876600h' : 'none',
  })
  revalidatePath('/admin')
}
