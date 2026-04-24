'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Eye, Download, CheckCircle, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { ToastContainer } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import {
  formatDate,
  formatCPF,
  formatPhone,
  getStatusLeadLabel,
  getStatusLeadColor,
} from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { APP_CONFIG } from '@/lib/constants'
import type { LeadCompleto, StatusLead } from '@/types'

const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'em_contato', label: 'Em contato' },
  { value: 'validado', label: 'Validado' },
  { value: 'reprovado', label: 'Reprovado' },
  { value: 'duplicado', label: 'Duplicado' },
  { value: 'convertido', label: 'Convertido' },
]

const PAGE_SIZE = 50

function escapeCsv(value: unknown): string {
  const str = String(value ?? '')
  return `"${str.replace(/"/g, '""')}"`
}

interface AdminLeadsClientProps {
  leads: LeadCompleto[]
}

export function AdminLeadsClient({ leads: initialData }: AdminLeadsClientProps) {
  const { toasts, toast, removeToast } = useToast()
  const [leads, setLeads] = useState(initialData)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterIndicador, setFilterIndicador] = useState('')
  const [selectedLead, setSelectedLead] = useState<LeadCompleto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editStatus, setEditStatus] = useState<StatusLead>('novo')
  const [editObs, setEditObs] = useState('')
  const [saving, setSaving] = useState(false)
  const [criarPagamento, setCriarPagamento] = useState(false)
  const [valorPagamento, setValorPagamento] = useState('')
  const [page, setPage] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  // Reset paginação quando filtros mudam
  useEffect(() => { setPage(1) }, [search, filterStatus, filterIndicador])

  const indicadores = useMemo(
    () => Array.from(new Set(leads.map((l) => l.indicador_nome).filter(Boolean))),
    [leads]
  )

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !search ||
        l.nome.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        l.cpf.includes(search) ||
        l.telefone.includes(search)
      const matchStatus = !filterStatus || l.status_lead === filterStatus
      const matchIndicador = !filterIndicador || l.indicador_nome === filterIndicador
      return matchSearch && matchStatus && matchIndicador
    })
  }, [leads, search, filterStatus, filterIndicador])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openModal(lead: LeadCompleto) {
    setSelectedLead(lead)
    setEditStatus(lead.status_lead)
    setEditObs(lead.observacoes || '')
    setCriarPagamento(false)
    setValorPagamento(APP_CONFIG.reward_value.toString())
    setModalOpen(true)
  }

  async function handleSaveStatus() {
    if (!selectedLead) return
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('leads')
      .update({ status_lead: editStatus, observacoes: editObs || null })
      .eq('id', selectedLead.id)

    if (error) {
      toast.error('Erro ao atualizar lead.')
      setSaving(false)
      return
    }

    // Criar pagamento ao validar — upsert com conflito em lead_id evita duplicatas
    if (criarPagamento && valorPagamento && selectedLead.indicador_id) {
      const { error: payError } = await supabase
        .from('pagamentos')
        .upsert(
          {
            indicador_id: selectedLead.indicador_id,
            lead_id: selectedLead.id,
            valor: parseFloat(valorPagamento),
            status_pagamento: 'elegivel',
            pix_chave: null,
            banco: null,
          },
          { onConflict: 'lead_id' }
        )
      if (payError) {
        toast.error('Lead atualizado, mas erro ao criar pagamento.')
      }
    }

    // Log de auditoria
    await supabase.from('logs_sistema').insert({
      usuario_tipo: 'administrador',
      usuario_id: userId,
      acao: 'atualizar_status_lead',
      entidade: 'leads',
      entidade_id: selectedLead.id,
      descricao: `Status alterado para "${getStatusLeadLabel(editStatus)}"${editObs ? ` — obs: ${editObs}` : ''}`,
    })

    setLeads((prev) =>
      prev.map((l) =>
        l.id === selectedLead.id
          ? { ...l, status_lead: editStatus, observacoes: editObs || null }
          : l
      )
    )
    toast.success('Lead atualizado com sucesso.')
    setModalOpen(false)
    setSaving(false)
  }

  function handleExport() {
    const header = ['Nome', 'CPF', 'Telefone', 'Email', 'Veículo', 'Cidade', 'Estado', 'Indicador', 'Status', 'Cadastro']
      .map(escapeCsv)
      .join(',')
    const rows = filtered.map((l) =>
      [
        l.nome,
        l.cpf,
        l.telefone,
        l.email,
        `${l.marca_veiculo || ''} ${l.modelo_veiculo || ''}`.trim(),
        l.cidade || '',
        l.estado || '',
        l.indicador_nome || '',
        l.status_lead,
        formatDate(l.created_at, 'dd/MM/yyyy'),
      ]
        .map(escapeCsv)
        .join(',')
    )

    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} de {leads.length} leads
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
            placeholder="Buscar por nome, CPF, telefone ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filterIndicador}
          onChange={(e) => setFilterIndicador(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todos os indicadores</option>
          {indicadores.map((ind) => (
            <option key={ind} value={ind!}>{ind}</option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3">Lead</th>
                <th className="text-left px-6 py-3">Contato</th>
                <th className="text-left px-6 py-3">Veículo</th>
                <th className="text-left px-6 py-3">Indicador</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Cadastro</th>
                <th className="text-left px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              ) : (
                paged.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{lead.nome}</p>
                      <p className="text-xs text-gray-400">{formatCPF(lead.cpf)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{formatPhone(lead.telefone)}</p>
                      <p className="text-xs text-gray-400">{lead.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {lead.marca_veiculo && lead.modelo_veiculo
                        ? `${lead.marca_veiculo} ${lead.modelo_veiculo} ${lead.ano_veiculo || ''}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 text-xs">{lead.indicador_nome || '—'}</p>
                      {lead.referral_code && (
                        <p className="text-xs text-gray-400 font-mono">{lead.referral_code}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusLeadColor(lead.status_lead)}`}
                      >
                        {getStatusLeadLabel(lead.status_lead)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {formatDate(lead.created_at, 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openModal(lead)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-50 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
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

      {/* Modal editar lead */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedLead?.nome}
        description="Detalhes e gerenciamento do lead"
        size="lg"
      >
        {selectedLead && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-500">CPF</p>
                <p className="text-sm font-medium">{formatCPF(selectedLead.cpf)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Telefone</p>
                <p className="text-sm font-medium">{formatPhone(selectedLead.telefone)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">E-mail</p>
                <p className="text-sm font-medium">{selectedLead.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Veículo</p>
                <p className="text-sm font-medium">
                  {[selectedLead.marca_veiculo, selectedLead.modelo_veiculo, selectedLead.ano_veiculo]
                    .filter(Boolean)
                    .join(' ') || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Placa</p>
                <p className="text-sm font-medium">{selectedLead.placa || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Localização</p>
                <p className="text-sm font-medium">
                  {selectedLead.cidade && selectedLead.estado
                    ? `${selectedLead.cidade}/${selectedLead.estado}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Indicador</p>
                <p className="text-sm font-medium">{selectedLead.indicador_nome || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Código</p>
                <p className="text-sm font-mono text-red-600">{selectedLead.referral_code || '—'}</p>
              </div>
            </div>

            <Select
              label="Status do lead"
              options={STATUS_OPTIONS}
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as StatusLead)}
            />

            <Textarea
              label="Observações internas"
              placeholder="Anotações da equipe sobre este lead..."
              value={editObs}
              onChange={(e) => setEditObs(e.target.value)}
            />

            {/* Criar pagamento ao validar */}
            {(editStatus === 'validado' || editStatus === 'convertido') &&
              selectedLead.indicador_id && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign size={16} className="text-green-600" />
                    <p className="text-sm font-semibold text-green-800">Gerar elegibilidade de pagamento</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-green-700 mb-3">
                    <input
                      type="checkbox"
                      checked={criarPagamento}
                      onChange={(e) => setCriarPagamento(e.target.checked)}
                      className="rounded border-green-300"
                    />
                    Criar pagamento elegível para o indicador
                  </label>
                  {criarPagamento && (
                    <Input
                      label="Valor do pagamento (R$)"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ex: 200.00"
                      value={valorPagamento}
                      onChange={(e) => setValorPagamento(e.target.value)}
                    />
                  )}
                </div>
              )}

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveStatus} loading={saving}>
                <CheckCircle size={15} />
                Salvar alterações
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
