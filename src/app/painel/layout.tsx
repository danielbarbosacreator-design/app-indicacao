import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarIndicador } from '@/components/layout/sidebar-indicador'

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: indicador } = await supabase
    .from('indicadores')
    .select('nome, email')
    .eq('auth_user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarIndicador
        nomeUsuario={indicador?.nome}
        emailUsuario={indicador?.email}
      />
      <main className="lg:pl-60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
