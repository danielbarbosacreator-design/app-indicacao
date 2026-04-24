import { createClient } from '@/lib/supabase/server'
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  MousePointerClick,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { formatCurrency, formatDate, getStatusLeadLabel, getStatusLeadColor } from '@/lib/utils'

export const metadata = { title: 'Dashboard Administrativo' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalIndicadores },
    { count: indicadoresAtivos },
    { count: totalLeads },
    { count: leadsNovos },
    { count: leadsEmAnalise },
    { count: leadsValidados },
    { count: leadsConvertidos },
    { count: leadsReprovados },
    { count: totalCliques },
    { data: pagamentosData },
    { data: leadsRecentes },
    { data: rankingData },
  ] = await Promise.all([
    supabase.from('indicadores').select('*', { count: 'exact', head: true }),
    supabase.from('indicadores').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status_lead', 'novo'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status_lead', 'em_analise'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status_lead', 'validado'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status_lead', 'convertido'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status_lead', 'reprovado'),
    supabase.from('cliques_indicacao').select('*', { count: 'exact', head: true }),
    supabase.from('pagamentos').select('valor, status_pagamento'),
    supabase
      .from('v_leads_completo')
      .select('id, nome, status_lead, created_at, indicador_nome, cidade, estado')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('v_indicadores_resumo')
      .select('id, nome, total_leads, leads_validados, valor_pago')
      .order('total_leads', { ascending: false })
      .limit(5),
  ])

  const valorTotalPago =
    pagamentosData?.filter((p) => p.status_pagamento === 'pago')
      .reduce((acc, p) => acc + Number(p.valor), 0) ?? 0

  const valorPendente =
    pagamentosData?.filter((p) => ['elegivel', 'em_processamento'].includes(p.status_pagamento))
      .reduce((acc, p) => acc + Number(p.valor), 0) ?? 0

  const pagamentosPendentes =
    pagamentosData?.filter((p) => ['elegivel', 'em_processamento'].includes(p.status_pagamento)).length ?? 0

  // Funil de conversão
  const statusFunil = [
    { label: 'Novos', count: leadsNovos ?? 0, color: 'bg-blue-500' },
    { label: 'Em análise', count: leadsEmAnalise ?? 0, color: 'bg-yellow-500' },
    { label: 'Validados', count: leadsValidados ?? 0, color: 'bg-green-500' },
    { label: 'Convertidos', count: leadsConvertidos ?? 0, color: 'bg-emerald-600' },
    { label: 'Reprovados', count: leadsReprovados ?? 0, color: 'bg-red-400' },
  ]
  const maxCount = Math.max(...statusFunil.map((s) => s.count), 1)

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do programa de indicação.</p>
      </div>

      {/* Stats principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Indicadores"
          value={totalIndicadores ?? 0}
          subtitle={`${indicadoresAtivos ?? 0} ativos`}
          icon={<Users size={20} />}
        />
        <StatCard
          title="Total de leads"
          value={totalLeads ?? 0}
          subtitle={`${leadsNovos ?? 0} novos aguardando`}
          icon={<FileText size={20} />}
          variant="warning"
        />
        <StatCard
          title="Qualificados"
          value={(leadsValidados ?? 0) + (leadsConvertidos ?? 0)}
          subtitle={`${leadsConvertidos ?? 0} convertidos`}
          icon={<CheckCircle size={20} />}
          variant="success"
        />
        <StatCard
          title="Total pago"
          value={formatCurrency(valorTotalPago)}
          subtitle={`${formatCurrency(valorPendente)} pendente`}
          icon={<DollarSign size={20} />}
          variant="primary"
        />
      </div>

      {/* Stats secundárias */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex items-center gap-3">
          <MousePointerClick size={18} className="text-purple-500 shrink-0" />
          <div>
            <p className="text-lg font-bold text-gray-900">{totalCliques ?? 0}</p>
            <p className="text-xs text-gray-500">Cliques no link</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex items-center gap-3">
          <Clock size={18} className="text-yellow-500 shrink-0" />
          <div>
            <p className="text-lg font-bold text-gray-900">{pagamentosPendentes}</p>
            <p className="text-xs text-gray-500">Pgtos pendentes</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex items-center gap-3">
          <TrendingUp size={18} className="text-green-500 shrink-0" />
          <div>
            <p className="text-lg font-bold text-gray-900">
              {totalLeads && totalLeads > 0
                ? `${Math.round(((leadsConvertidos ?? 0) / totalLeads) * 100)}%`
                : '0%'}
            </p>
            <p className="text-xs text-gray-500">Taxa conversão</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex items-center gap-3">
          <DollarSign size={18} className="text-brand-500 shrink-0" />
          <div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(valorPendente)}</p>
            <p className="text-xs text-gray-500">A pagar</p>
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div className="flex flex-wrap gap-3 mb-8">
        {(leadsNovos ?? 0) > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
            <AlertCircle size={16} className="text-blue-600 shrink-0" />
            <p className="text-blue-800">
              <span className="font-semibold">{leadsNovos} leads novos</span> aguardando análise
            </p>
            <a href="/admin/leads" className="text-blue-600 font-medium hover:underline ml-1">
              Ver →
            </a>
          </div>
        )}
        {pagamentosPendentes > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
            <Clock size={16} className="text-yellow-600 shrink-0" />
            <p className="text-yellow-800">
              <span className="font-semibold">{pagamentosPendentes} pagamentos</span>{' '}
              ({formatCurrency(valorPendente)}) aguardando processamento
            </p>
            <a href="/admin/pagamentos" className="text-yellow-700 font-medium hover:underline ml-1">
              Ver →
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Leads recentes */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Leads recentes</h2>
            <a href="/admin/leads" className="text-sm text-brand-600 hover:underline">
              Ver todos
            </a>
          </div>
          {!leadsRecentes || leadsRecentes.length === 0 ? (
            <p className="text-sm text-gray-400 px-6 py-10 text-center">Nenhum lead registrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-50 bg-gray-50">
                    <th className="text-left px-6 py-3">Nome</th>
                    <th className="text-left px-6 py-3">Indicador</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leadsRecentes.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{lead.nome}</td>
                      <td className="px-6 py-3 text-gray-500 text-xs">
                        {lead.indicador_nome || '—'}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusLeadColor(lead.status_lead as any)}`}
                        >
                          {getStatusLeadLabel(lead.status_lead as any)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-xs">
                        {formatDate(lead.created_at, 'dd/MM/yy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top indicadores */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Top indicadores</h2>
            <a href="/admin/indicadores" className="text-sm text-brand-600 hover:underline">
              Ver todos
            </a>
          </div>
          {!rankingData || rankingData.length === 0 ? (
            <p className="text-sm text-gray-400 px-6 py-10 text-center">Nenhum indicador.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {rankingData.map((ind, i) => (
                <li key={ind.id} className="px-6 py-4 flex items-center gap-4">
                  <span className="text-xl font-black text-gray-200 w-5 text-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ind.nome}</p>
                    <p className="text-xs text-gray-400">
                      {ind.total_leads} leads · {ind.leads_validados} validados
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 shrink-0">
                    {formatCurrency(ind.valor_pago)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Funil de conversão */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Funil de leads por status</h2>
        <div className="space-y-3">
          {statusFunil.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-24 shrink-0">{item.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${item.color}`}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-8 text-right shrink-0">
                {item.count}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total recebidos</p>
            <p className="text-lg font-bold text-gray-900">{totalLeads ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Em andamento</p>
            <p className="text-lg font-bold text-yellow-600">
              {(leadsNovos ?? 0) + (leadsEmAnalise ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Qualificados</p>
            <p className="text-lg font-bold text-green-600">
              {(leadsValidados ?? 0) + (leadsConvertidos ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Taxa aprovação</p>
            <p className="text-lg font-bold text-brand-600">
              {totalLeads && totalLeads > 0
                ? `${Math.round((((leadsValidados ?? 0) + (leadsConvertidos ?? 0)) / totalLeads) * 100)}%`
                : '0%'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
