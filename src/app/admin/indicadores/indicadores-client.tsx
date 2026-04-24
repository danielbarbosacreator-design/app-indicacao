'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Copy, UserX, UserCheck, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { ToastContainer } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import {
  formatDate,
  formatCurrency,
  formatPhone,
  formatCPF,
  getStatusIndicadorLabel,
  getStatusIndicadorColor,
  buildReferralLink,
} from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { IndicadorResumo, StatusIndicador } from '@/types'

const PAGE_SIZE = 50

function escapeCsv(value: unknown): string {
  const str = String(value ?? '')
  return `"${str.replace(/"/g, '""')}"`
}

interface AdminIndicadoresClientProps {
  indicadores: IndicadorResumo[]
}

export function AdminIndicadoresClient({ indicadores: initialData }: AdminIndicadoresClientProps) {
  const { toasts, toast, removeToast } = useToast()
  const [indicadores, setIndicadores] = useState(initialData)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedIndicador, setSelectedIndicador] = useState<IndicadorResumo | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  useEffect(() => { setPage(1) }, [search, selectedStatus])

  const filtered = useMemo(() => {
    return indicadores.filter((ind) => {
      const matchSearch =
        !search ||
        ind.nome.toLowerCase().includes(search.toLowerCase()) ||
        ind.email.toLowerCase().includes(search.toLowerCase()) ||
        (ind.cpf || '').includes(search) ||
        (ind.telefone || '').includes(search)
      const matchStatus = !selectedStatus || ind.status === selectedStatus
      return matchSearch && matchStatus
    })
  }, [indicadores, search, selectedStatus])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleStatusChange(id: string, newStatus: StatusIndicador) {
    setActionLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('indicadores')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('Erro ao atualizar status.')
    } else {
      // Log de auditoria
      await supabase.from('logs_sistema').insert({
        usuario_tipo: 'administrador',
        usuario_id: userId,
        acao: 'atualizar_status_indicador',
        entidade: 'indicadores',
        entidade_id: id,
        descricao: `Status alterado para "${getStatusIndicadorLabel(newStatus)}"`,
      })

      setIndicadores((prev) =>
        prev.map((ind) => (ind.id === id ? { ...ind, status: newStatus } : ind))
      )
      setDetailOpen(false)
      toast.success(`Status atualizado para "${getStatusIndicadorLabel(newStatus)}".`)
    }
    setActionLoading(false)
  }

  async function copyLink(code: string) {
    const link = buildReferralLink(code)
    await navigator.clipboard.writeText(link)
    toast.success('Link copiado!')
  }

  function openDetail(ind: IndicadorResumo) {
    setSelectedIndicador(ind)
    setDetailOpen(true)
  }

  function handleExport() {
    const header = ['Nome', 'Email', 'Telefone', 'CPF', 'Banco', 'Pix', 'Status', 'Total Leads', 'Valor Pago', 'Cadastro']
      .map(escapeCsv)
      .join(',')
    const rows = filtered.map((ind) =>
      [
        ind.nome,
        ind.email,
        ind.telefone || '',
        ind.cpf || '',
        ind.banco || '',
        ind.pix_chave || '',
        ind.status,
        ind.total_leads,
        ind.valor_pago,
        formatDate(ind.created_at, 'dd/MM/yyyy'),
      ]
        .map(escapeCsv)
        .join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `indicadores_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Indicadores</h1>
          <p className="text-gray-500 text-sm mt-1">
            {indicadores.length} indicadores cadastrados
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} size="sm">
          <Download size={15} />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome, e-mail, CPF ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="bloqueado">Bloqueado</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3">Nome</th>
                <th className="text-left px-6 py-3">Contato</th>
                <th className="text-left px-6 py-3">Leads</th>
                <th className="text-left px-6 py-3">Validados</th>
                <th className="text-left px-6 py-3">Valor pago</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Cadastro</th>
                <th className="text-left px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Nenhum indicador encontrado.
                  </td>
                </tr>
              ) : (
                paged.map((ind) => (
                  <tr key={ind.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{ind.nome}</p>
                      {ind.cpf && <p className="text-xs text-gray-400">{formatCPF(ind.cpf)}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{ind.email}</p>
                      {ind.telefone && <p className="text-xs text-gray-400">{formatPhone(ind.telefone)}</p>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{ind.total_leads}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">{ind.leads_validados}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(ind.valor_pago)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusIndicadorColor(ind.status)}`}
                      >
                        {getStatusIndicadorLabel(ind.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {formatDate(ind.created_at, 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDetail(ind)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => copyLink(ind.referral_code)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Copiar link"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Página {page} de {totalPages} &middot; {filtered.length} resultados
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                <ChevronLeft size={15} />
                Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
                Próxima
                <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedIndicador?.nome}
        description="Detalhes completos do indicador"
        size="lg"
      >
        {selectedIndicador && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">E-mail</p>
                <p className="text-sm font-medium text-gray-900">{selectedIndicador.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Telefone</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedIndicador.telefone ? formatPhone(selectedIndicador.telefone) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">CPF</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedIndicador.cpf ? formatCPF(selectedIndicador.cpf) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Banco</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedIndicador.banco || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tipo Pix</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedIndicador.pix_tipo || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Chave Pix</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedIndicador.pix_chave || '—'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Link de indicação</p>
              <p className="text-xs font-mono text-brand-700 break-all">
                {buildReferralLink(selectedIndicador.referral_code)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xl font-bold text-blue-700">{selectedIndicador.total_leads}</p>
                <p className="text-xs text-blue-500">Total leads</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xl font-bold text-green-700">{selectedIndicador.leads_validados}</p>
                <p className="text-xs text-green-500">Validados</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xl font-bold text-purple-700">
                  {formatCurrency(selectedIndicador.valor_pago)}
                </p>
                <p className="text-xs text-purple-500">Valor pago</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {selectedIndicador.status !== 'bloqueado' ? (
                <Button
                  variant="danger"
                  size="sm"
                  loading={actionLoading}
                  onClick={() => handleStatusChange(selectedIndicador.id, 'bloqueado')}
                >
                  <UserX size={15} />
                  Bloquear indicador
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  loading={actionLoading}
                  onClick={() => handleStatusChange(selectedIndicador.id, 'ativo')}
                >
                  <UserCheck size={15} />
                  Reativar indicador
                </Button>
              )}
              {selectedIndicador.status === 'ativo' && (
                <Button
                  variant="ghost"
                  size="sm"
                  loading={actionLoading}
                  onClick={() => handleStatusChange(selectedIndicador.id, 'inativo')}
                >
                  Inativar
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
