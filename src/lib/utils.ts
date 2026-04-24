import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { StatusLead, StatusPagamento, StatusIndicador } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string, fmt = "dd/MM/yyyy 'às' HH:mm") {
  try {
    return format(parseISO(dateStr), fmt, { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr: string) {
  return formatDate(dateStr, 'dd/MM/yyyy')
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, '')
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function maskCPF(cpf: string) {
  const formatted = formatCPF(cpf)
  return formatted.replace(/(\d{3})\.\d{3}\.\d{3}(-\d{2})/, '$1.***.***$2') || cpf
}

export function formatCPFInput(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function formatPhoneInput(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export function maskPhone(phone: string) {
  const formatted = formatPhone(phone)
  return formatted.replace(/(\(\d{2}\)) \d{4,5}/, '$1 ****')
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function getStatusLeadLabel(status: StatusLead): string {
  const map: Record<StatusLead, string> = {
    novo: 'Novo',
    em_analise: 'Em análise',
    em_contato: 'Em contato',
    validado: 'Validado',
    reprovado: 'Reprovado',
    duplicado: 'Duplicado',
    convertido: 'Convertido',
  }
  return map[status] ?? status
}

export function getStatusLeadColor(status: StatusLead): string {
  const map: Record<StatusLead, string> = {
    novo: 'bg-blue-100 text-blue-700',
    em_analise: 'bg-yellow-100 text-yellow-700',
    em_contato: 'bg-orange-100 text-orange-700',
    validado: 'bg-green-100 text-green-700',
    reprovado: 'bg-red-100 text-red-700',
    duplicado: 'bg-gray-100 text-gray-600',
    convertido: 'bg-emerald-100 text-emerald-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

export function getStatusPagamentoLabel(status: StatusPagamento): string {
  const map: Record<StatusPagamento, string> = {
    nao_elegivel: 'Não elegível',
    elegivel: 'Elegível',
    em_processamento: 'Em processamento',
    pago: 'Pago',
    cancelado: 'Cancelado',
  }
  return map[status] ?? status
}

export function getStatusPagamentoColor(status: StatusPagamento): string {
  const map: Record<StatusPagamento, string> = {
    nao_elegivel: 'bg-gray-100 text-gray-600',
    elegivel: 'bg-blue-100 text-blue-700',
    em_processamento: 'bg-yellow-100 text-yellow-700',
    pago: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

export function getStatusIndicadorLabel(status: StatusIndicador): string {
  const map: Record<StatusIndicador, string> = {
    ativo: 'Ativo',
    inativo: 'Inativo',
    bloqueado: 'Bloqueado',
  }
  return map[status] ?? status
}

export function getStatusIndicadorColor(status: StatusIndicador): string {
  const map: Record<StatusIndicador, string> = {
    ativo: 'bg-green-100 text-green-700',
    inativo: 'bg-gray-100 text-gray-600',
    bloqueado: 'bg-red-100 text-red-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/55${digits}?text=${encoded}`
}

export function buildReferralLink(code: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  return `${base}/indique/${code}`
}
