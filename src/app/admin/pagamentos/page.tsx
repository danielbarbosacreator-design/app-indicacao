import { createClient } from '@/lib/supabase/server'
import { AdminPagamentosClient } from './pagamentos-client'

export const metadata = { title: 'Gestão de Pagamentos' }

export default async function AdminPagamentosPage() {
  const supabase = await createClient()

  const { data: pagamentos } = await supabase
    .from('pagamentos')
    .select(`
      *,
      indicadores ( nome, email, pix_tipo, pix_chave, banco ),
      leads ( nome, cpf )
    `)
    .order('created_at', { ascending: false })

  return <AdminPagamentosClient pagamentos={pagamentos ?? []} />
}
