import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PerfilClient } from './perfil-client'

export const metadata = { title: 'Meu Perfil' }

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: indicador } = await supabase
    .from('indicadores')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!indicador) redirect('/login')

  return <PerfilClient indicador={indicador} />
}
