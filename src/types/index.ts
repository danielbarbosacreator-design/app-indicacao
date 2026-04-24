export type StatusLead =
  | 'novo'
  | 'em_analise'
  | 'em_contato'
  | 'validado'
  | 'reprovado'
  | 'duplicado'
  | 'convertido'

export type StatusPagamento =
  | 'nao_elegivel'
  | 'elegivel'
  | 'em_processamento'
  | 'pago'
  | 'cancelado'

export type StatusIndicador = 'ativo' | 'inativo' | 'bloqueado'

export type PixTipo = 'cpf' | 'cnpj' | 'email' | 'telefone' | 'chave_aleatoria'

export type AuthProvider = 'email' | 'google'

export interface Indicador {
  id: string
  auth_user_id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  pix_tipo: PixTipo | null
  pix_chave: string | null
  banco: string | null
  referral_code: string
  referral_link: string
  status: StatusIndicador
  auth_provider: AuthProvider
  created_at: string
  updated_at: string
}

export interface IndicadorResumo extends Indicador {
  total_leads: number
  leads_validados: number
  leads_convertidos: number
  pagamentos_realizados: number
  valor_pago: number
  valor_pendente: number
}

export interface Lead {
  id: string
  indicador_id: string | null
  referral_code: string | null
  nome: string
  cpf: string
  telefone: string
  email: string
  marca_veiculo: string | null
  modelo_veiculo: string | null
  ano_veiculo: string | null
  placa: string | null
  cidade: string | null
  estado: string | null
  status_lead: StatusLead
  observacoes: string | null
  duplicado_de: string | null
  created_at: string
  updated_at: string
}

export interface LeadCompleto extends Lead {
  indicador_nome: string | null
  indicador_email: string | null
  indicador_telefone: string | null
  indicador_referral_code: string | null
}

export interface Pagamento {
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
}

export interface CliqueIndicacao {
  id: string
  indicador_id: string | null
  referral_code: string
  ip: string | null
  device: string | null
  user_agent: string | null
  source: string | null
  clicked_at: string
}

export interface LogSistema {
  id: string
  usuario_tipo: 'indicador' | 'administrador' | 'sistema'
  usuario_id: string | null
  acao: string
  entidade: string | null
  entidade_id: string | null
  descricao: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface DashboardStats {
  total_indicadores: number
  indicadores_ativos: number
  total_leads: number
  leads_novos: number
  leads_validados: number
  leads_convertidos: number
  pagamentos_pendentes: number
  pagamentos_realizados: number
  valor_total_pago: number
  valor_total_pendente: number
}

export interface IndicadorDashboardStats {
  total_indicacoes: number
  indicacoes_pendentes: number
  indicacoes_validadas: number
  indicacoes_pagas: number
  valor_acumulado: number
  valor_pendente: number
}
