import { createClient } from '@/lib/supabase/server'
import { AdminIndicadoresClient } from './indicadores-client'

export const metadata = { title: 'Gestão de Indicadores' }

export default async function AdminIndicadoresPage() {
  const supabase = await createClient()

  const { data: indicadores } = await supabase
    .from('v_indicadores_resumo')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminIndicadoresClient indicadores={indicadores ?? []} />
}
