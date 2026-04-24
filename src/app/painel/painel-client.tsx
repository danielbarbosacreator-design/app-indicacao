'use client'

import { useState } from 'react'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import {
  Copy,
  Share2,
  CheckCircle,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/stat-card'
import { ToastContainer } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import {
  formatCurrency,
  formatDate,
  getStatusLeadLabel,
  getStatusLeadColor,
  getStatusPagamentoLabel,
  getStatusPagamentoColor,
  buildReferralLink,
} from '@/lib/utils'
import type { Indicador } from '@/types'

interface PainelIndicadorClientProps {
  indicador: Indicador
  stats: {
    total_indicacoes: number
    indicacoes_pendentes: number
    indicacoes_validadas: number
    indicacoes_pagas: number
    valor_acumulado: number
    valor_pendente: number
  }
  leads: Array<{
    id: string
    status_lead: string
    created_at: string
  }>
  pagamentos: Array<{
    id: string
    valor: number
    status_pagamento: string
    created_at: string
    paid_at: string | null
  }>
}

export function PainelIndicadorClient({
  indicador,
  stats,
  leads,
  pagamentos,
}: PainelIndicadorClientProps) {
  const { toasts, toast, removeToast } = useToast()
  const [copied, setCopied] = useState(false)

  // Show onboarding if phone or PIX is missing
  const needsOnboarding = !indicador.telefone || !indicador.pix_chave
  const [showOnboarding, setShowOnboarding] = useState(needsOnboarding)

  const referralLink = buildReferralLink(indicador.referral_code)

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success('Link copiado para a área de transferência!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Não foi possível copiar o link.')
    }
  }

  function handleWhatsApp() {
    const message =
      `Olá! Quero te apresentar a Auto Excelência, empresa especializada em proteção veicular. ` +
      `Faça seu cadastro e solicite uma proposta: ${referralLink}`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Onboarding modal — shown when phone or PIX is missing */}
      {showOnboarding && (
        <OnboardingModal
          indicador={indicador}
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {indicador.nome.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Acompanhe suas indicações e ganhos abaixo.
        </p>
      </div>

      {/* Link card */}
      <div className="bg-black rounded-xl p-6 text-white mb-8">
        <p className="text-sm text-gray-300 font-medium mb-1">Seu link exclusivo de indicação</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 bg-white/15 rounded-lg px-4 py-2.5 font-mono text-sm break-all">
            {referralLink}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/20 hover:border-white/60"
            >
              {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
            <Button
              onClick={handleWhatsApp}
              size="sm"
              className="bg-[#25D366] hover:bg-[#1ebe5b] text-white border-0"
            >
              <Share2 size={15} />
              WhatsApp
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-300 mt-3">
          Compartilhe este link e cada pessoa que se cadastrar será vinculada automaticamente a você.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total de indicações"
          value={stats.total_indicacoes}
          icon={<Users size={20} />}
        />
        <StatCard
          title="Em andamento"
          value={stats.indicacoes_pendentes}
          icon={<Clock size={20} />}
          variant="warning"
        />
        <StatCard
          title="Validadas"
          value={stats.indicacoes_validadas}
          icon={<CheckCircle size={20} />}
          variant="success"
        />
        <StatCard
          title="Pagas"
          value={stats.indicacoes_pagas}
          icon={<DollarSign size={20} />}
          variant="primary"
        />
      </div>

      {/* Valores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Valor acumulado total</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.valor_acumulado)}</p>
          <p className="text-xs text-gray-400 mt-1">Soma de todos os pagamentos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Valor pendente de pagamento</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.valor_pendente)}</p>
          <p className="text-xs text-gray-400 mt-1">Elegível ou em processamento</p>
        </div>
      </div>

      {/* Tabela de indicações recentes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Indicações recentes</h2>
            <p className="text-xs text-gray-400 mt-0.5">Últimas indicações geradas pelo seu link</p>
          </div>
          <a href="/painel/indicacoes" className="text-sm text-red-600 hover:underline flex items-center gap-1">
            Ver todas
            <ExternalLink size={12} />
          </a>
        </div>

        {leads.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">Nenhuma indicação ainda</p>
            <p className="text-gray-400 text-xs mt-1">
              Compartilhe seu link para começar a gerar indicações.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-6 py-3">Cadastrado em</th>
                  <th className="text-left px-6 py-3">Identificação</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.slice(0, 10).map((lead, i) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-600">
                      {formatDate(lead.created_at, 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-3 text-gray-700 font-medium">
                      Indicação #{String(i + 1).padStart(3, '0')}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusLeadColor(lead.status_lead as any)}`}
                      >
                        {getStatusLeadLabel(lead.status_lead as any)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagamentos recentes */}
      {pagamentos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Histórico de pagamentos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-6 py-3">Data</th>
                  <th className="text-left px-6 py-3">Valor</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagamentos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-600">
                      {formatDate(p.paid_at || p.created_at, 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      {formatCurrency(p.valor)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusPagamentoColor(p.status_pagamento as any)}`}
                      >
                        {getStatusPagamentoLabel(p.status_pagamento as any)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
