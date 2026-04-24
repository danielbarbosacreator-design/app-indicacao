import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarAdmin } from '@/components/layout/sidebar-admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: admin } = await supabase
    .from('administradores')
    .select('nome')
    .eq('auth_user_id', user.id)
    .single()

  if (!admin) redirect('/painel')

  // Contar leads novos para badge de notificação
  const { count: leadsNovos } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status_lead', 'novo')

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarAdmin nomeAdmin={admin.nome} leadsNovos={leadsNovos ?? 0} />
      <main className="lg:pl-60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
