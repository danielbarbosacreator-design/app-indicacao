import { createClient } from '@/lib/supabase/server'
import { AdminLeadsClient } from './leads-client'

export const metadata = { title: 'Gestão de Leads' }

export default async function AdminLeadsPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from('v_leads_completo')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminLeadsClient leads={leads ?? []} />
}
