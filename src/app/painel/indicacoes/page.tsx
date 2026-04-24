import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusLeadLabel, getStatusLeadColor } from '@/lib/utils'

export const metadata = { title: 'Minhas Indicações' }

export default async function MinhasIndicacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: indicador } = await supabase
    .from('indicadores')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!indicador) redirect('/login')

  const { data: leads } = await supabase
    .from('leads')
    .select('id, status_lead, created_at, updated_at, cidade, estado, marca_veiculo, modelo_veiculo')
    .eq('indicador_id', indicador.id)
    .order('created_at', { ascending: false })

  const statusCounts = {
    novo: leads?.filter((l) => l.status_lead === 'novo').length ?? 0,
    em_analise: leads?.filter((l) => l.status_lead === 'em_analise').length ?? 0,
    em_contato: leads?.filter((l) => l.status_lead === 'em_contato').length ?? 0,
    validado: leads?.filter((l) => l.status_lead === 'validado').length ?? 0,
    convertido: leads?.filter((l) => l.status_lead === 'convertido').length ?? 0,
    reprovado: leads?.filter((l) => l.status_lead === 'reprovado').length ?? 0,
    duplicado: leads?.filter((l) => l.status_lead === 'duplicado').length ?? 0,
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Indicações</h1>
        <p className="text-gray-500 text-sm mt-1">
          Histórico completo de todas as suas indicações.
        </p>
      </div>

      {/* Resumo por status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {[
          { key: 'novo', label: 'Novos', color: 'bg-blue-50 text-blue-700' },
          { key: 'em_analise', label: 'Em análise', color: 'bg-yellow-50 text-yellow-700' },
          { key: 'em_contato', label: 'Em contato', color: 'bg-orange-50 text-orange-700' },
          { key: 'validado', label: 'Validados', color: 'bg-green-50 text-green-700' },
          { key: 'convertido', label: 'Convertidos', color: 'bg-emerald-50 text-emerald-700' },
          { key: 'reprovado', label: 'Reprovados', color: 'bg-red-50 text-red-700' },
          { key: 'duplicado', label: 'Duplicados', color: 'bg-gray-50 text-gray-600' },
        ].map((s) => (
          <div
            key={s.key}
            className={`rounded-xl p-4 text-center ${s.color}`}
          >
            <p className="text-2xl font-bold">{statusCounts[s.key as keyof typeof statusCounts]}</p>
            <p className="text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Todas as indicações ({leads?.length ?? 0})
          </h2>
        </div>

        {!leads || leads.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-gray-400 text-sm">Nenhuma indicação registrada ainda.</p>
            <p className="text-gray-400 text-xs mt-1">
              Compartilhe seu link para começar a gerar indicações.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3">#</th>
                  <th className="text-left px-6 py-3">Data do cadastro</th>
                  <th className="text-left px-6 py-3">Veículo</th>
                  <th className="text-left px-6 py-3">Localização</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Última atualização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead, i) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      #{String(leads.length - i).padStart(3, '0')}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatDate(lead.created_at, 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {lead.marca_veiculo && lead.modelo_veiculo
                        ? `${lead.marca_veiculo} ${lead.modelo_veiculo}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {lead.cidade && lead.estado ? `${lead.cidade}/${lead.estado}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusLeadColor(lead.status_lead as any)}`}
                      >
                        {getStatusLeadLabel(lead.status_lead as any)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {formatDate(lead.updated_at, 'dd/MM/yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
