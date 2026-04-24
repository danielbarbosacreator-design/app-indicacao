import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PainelIndicadorClient } from './painel-client'

export const metadata = { title: 'Meu Painel' }

export default async function PainelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: indicador } = await supabase
    .from('indicadores')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!indicador) redirect('/login')

  // Buscar estatísticas
  const { data: leads } = await supabase
    .from('leads')
    .select('id, status_lead, created_at')
    .eq('indicador_id', indicador.id)
    .order('created_at', { ascending: false })

  const { data: pagamentos } = await supabase
    .from('pagamentos')
    .select('id, valor, status_pagamento, created_at, paid_at')
    .eq('indicador_id', indicador.id)
    .order('created_at', { ascending: false })

  const stats = {
    total_indicacoes: leads?.length ?? 0,
    indicacoes_pendentes: leads?.filter((l) =>
      ['novo', 'em_analise', 'em_contato'].includes(l.status_lead)
    ).length ?? 0,
    indicacoes_validadas: leads?.filter((l) =>
      ['validado', 'convertido'].includes(l.status_lead)
    ).length ?? 0,
    indicacoes_pagas: pagamentos?.filter((p) => p.status_pagamento === 'pago').length ?? 0,
    valor_acumulado: pagamentos?.filter((p) => p.status_pagamento === 'pago')
      .reduce((acc, p) => acc + Number(p.valor), 0) ?? 0,
    valor_pendente:
      pagamentos
        ?.filter((p) => ['elegivel', 'em_processamento'].includes(p.status_pagamento))
        .reduce((acc, p) => acc + Number(p.valor), 0) ?? 0,
  }

  return (
    <PainelIndicadorClient
      indicador={indicador}
      stats={stats}
      leads={leads ?? []}
      pagamentos={pagamentos ?? []}
    />
  )
}
