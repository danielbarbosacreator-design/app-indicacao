'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Eye, CheckCircle, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { ToastContainer } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import {
  formatDate,
  formatCurrency,
  getStatusPagamentoLabel,
  getStatusPagamentoColor,
} from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { StatusPagamento } from '@/types'

const STATUS_OPTIONS = [
  { value: 'nao_elegivel', label: 'Não elegível' },
  { value: 'elegivel', label: 'Elegível' },
  { value: 'em_processamento', label: 'Em processamento' },
  { value: 'pago', label: 'Pago' },
  { value: 'cancelado', label: 'Cancelado' },
]

const PAGE_SIZE = 50

function escapeCsv(value: unknown): string {
  const str = String(value ?? '')
  return `"${str.replace(/"/g, '""')}"`
}

type PagamentoCompleto = {
  id: string
  indicador_id: string
  lead_id: string | null
  valor: number
  status_pagamento: StatusPagamento
  pix_chave: string | null
  banco: string | null
  comprovante_url: string | null
  observacoes: string | null
  data_prevista: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
  indicadores: {
    nome: string
    email: string
    pix_tipo: string | null
    pix_chave: string | null
    banco: string | null
  } | null
  leads: { nome: string; cpf: string } | null
}

interface AdminPagamentosClientProps {
  pagamentos: PagamentoCompleto[]
}

export function AdminPagamentosClient({ pagamentos: initialData }: AdminPagamentosClientProps) {
  const { toasts, toast, removeToast } = useToast()
  const [pagamentos, setPagamentos] = useState(initialData)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selected, setSelected] = useState<PagamentoCompleto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editStatus, setEditStatus] = useState<StatusPagamento>('nao_elegivel')
  const [editValor, setEditValor] = useState('')
  const [editObs, setEditObs] = useState('')
  const [editDataPrevista, setEditDataPrevista] = useState('')
  const [editComprovante, setEditComprovante] = useState('')
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  useEffect(() => { setPage(1) }, [search, filterStatus])

  const filtered = useMemo(() => {
    return pagamentos.filter((p) => {
      const matchSearch =
        !search ||
        p.indicadores?.nome.toLowerCase().includes(search.toLowerCase()) ||
        p.indicadores?.email.toLowerCase().includes(search.toLowerCase()) ||
        (p.leads?.nome ?? '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = !filterStatus || p.status_pagamento === filterStatus
      return matchSearch && matchStatus
    })
  }, [pagamentos, search, filterStatus])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totais = useMemo(() => ({
    pago: pagamentos.filter((p) => p.status_pagamento === 'pago').reduce((a, p) => a + Number(p.valor), 0),
    pendente: pagamentos
      .filter((p) => ['elegivel', 'em_processamento'].includes(p.status_pagamento))
      .reduce((a, p) => a + Number(p.valor), 0),
    total: pagamentos.reduce((a, p) => a + Number(p.valor), 0),
  }), [pagamentos])

  function openModal(p: PagamentoCompleto) {
    setSelected(p)
    setEditStatus(p.status_pagamento)
    setEditValor(String(p.valor))
    setEditObs(p.observacoes || '')
    setEditDataPrevista(p.data_prevista || '')
    setEditComprovante(p.comprovante_url || '')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    const supabase = createClient()

    const updates: Record<string, unknown> = {
      status_pagamento: editStatus,
      valor: parseFloat(editValor) || selected.valor,
      observacoes: editObs || null,
      data_prevista: editDataPrevista || null,
      comprovante_url: editComprovante || null,
    }

    if (editStatus === 'pago' && !selected.paid_at) {
      updates.paid_at = new Date().toISOString()
    }

    const { error } = await supabase.from('pagamentos').update(updates).eq('id', selected.id)

    if (error) {
      toast.error('Erro ao salvar pagamento.')
    } else {
      // Log de auditoria
      await supabase.from('logs_sistema').insert({
        usuario_tipo: 'administrador',
        usuario_id: userId,
        acao: 'atualizar_pagamento',
        entidade: 'pagamentos',
        entidade_id: selected.id,
        descricao: `Status alterado para "${getStatusPagamentoLabel(editStatus)}" — valor: R$ ${updates.valor}`,
      })

      setPagamentos((prev) =>
        prev.map((p) =>
          p.id === selected.id ? { ...p, ...updates, status_pagamento: editStatus } : p
        )
      )
      toast.success('Pagamento atualizado.')
      setModalOpen(false)
    }
    setSaving(false)
  }

  function handleExport() {
    const header = ['Indicador', 'Lead', 'Valor', 'Status', 'Pix', 'Banco', 'Data Prevista', 'Data Pago']
      .map(escapeCsv)
      .join(',')
    const rows = filtered.map((p) =>
      [
        p.indicadores?.nome || '',
        p.leads?.nome || '',
        p.valor,
        p.status_pagamento,
        p.indicadores?.pix_chave || '',
        p.indicadores?.banco || '',
        p.data_prevista || '',
        p.paid_at ? formatDate(p.paid_at, 'dd/MM/yyyy') : '',
      ]
        .map(escapeCsv)
        .join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pagamentos_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
          <p className="text-gray-500 text-sm mt-1">Controle de repasses aos indicadores</p>
        </div>
        <Button variant="outline" onClick={handleExport} size="sm">
          <Download size={15} />
          Exportar CSV
        </Button>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
          <p className="text-sm text-gray-500 mb-1">Total pago</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totais.pago)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
          <p className="text-sm text-gray-500 mb-1">Pendente de pagamento</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totais.pendente)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
          <p className="text-sm text-gray-500 mb-1">Volume total</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totais.total)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por indicador ou lead..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3">Indicador</th>
                <th className="text-left px-6 py-3">Lead relacionado</th>
                <th className="text-left px-6 py-3">Valor</th>
                <th className="text-left px-6 py-3">Chave Pix</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Data prevista</th>
                <th className="text-left px-6 py-3">Pago em</th>
                <th className="text-left px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Nenhum pagamento encontrado.
                  </td>
                </tr>
              ) : (
                paged.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{p.indicadores?.nome || '—'}</p>
                      <p className="text-xs text-gray-400">{p.indicadores?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-xs">
                      {p.leads?.nome || '—'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(p.valor)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-gray-700">
                        {p.indicadores?.pix_chave || '—'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.indicadores?.pix_tipo || ''} · {p.indicadores?.banco || ''}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusPagamentoColor(p.status_pagamento)}`}
                      >
                        {getStatusPagamentoLabel(p.status_pagamento)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {p.data_prevista ? formatDate(p.data_prevista + 'T00:00:00', 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {p.paid_at ? formatDate(p.paid_at, 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openModal(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
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

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Gerenciar Pagamento"
        description={selected?.indicadores?.nome}
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Indicador</p>
                <p className="font-medium">{selected.indicadores?.nome}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Lead</p>
                <p className="font-medium">{selected.leads?.nome || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Chave Pix</p>
                <p className="font-mono text-xs">{selected.indicadores?.pix_chave || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Banco</p>
                <p className="font-medium">{selected.indicadores?.banco || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Valor (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editValor}
                  onChange={(e) => setEditValor(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Data prevista</label>
                <input
                  type="date"
                  value={editDataPrevista}
                  onChange={(e) => setEditDataPrevista(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <Select
              label="Status do pagamento"
              options={STATUS_OPTIONS}
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as StatusPagamento)}
            />

            <Input
              label="URL do comprovante (opcional)"
              placeholder="https://..."
              value={editComprovante}
              onChange={(e) => setEditComprovante(e.target.value)}
            />

            <Textarea
              label="Observações"
              placeholder="Notas sobre este pagamento..."
              value={editObs}
              onChange={(e) => setEditObs(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} loading={saving}>
                <CheckCircle size={15} />
                Salvar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
