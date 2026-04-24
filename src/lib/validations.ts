import { z } from 'zod'

const cpfValidate = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(digits[10])
}

export const cadastroIndicadorSchema = z
  .object({
    nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    telefone: z
      .string()
      .min(10, 'Telefone inválido')
      .transform((v) => v.replace(/\D/g, '')),
    cpf: z
      .string()
      .min(11, 'CPF inválido')
      .refine((v) => cpfValidate(v), 'CPF inválido'),
    senha: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
    confirmar_senha: z.string(),
    pix_tipo: z.enum(['cpf', 'cnpj', 'email', 'telefone', 'chave_aleatoria']).optional(),
    pix_chave: z.string().optional(),
    banco: z.string().optional(),
  })
  .refine((data) => data.senha === data.confirmar_senha, {
    message: 'As senhas não coincidem',
    path: ['confirmar_senha'],
  })

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha'),
})

export const esqueciSenhaSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export const leadEtapa1Schema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cpf: z
    .string()
    .min(11, 'CPF inválido')
    .refine((v) => cpfValidate(v), 'CPF inválido'),
  telefone: z
    .string()
    .min(10, 'Telefone inválido')
    .transform((v) => v.replace(/\D/g, '')),
  email: z.string().email('E-mail inválido'),
})

export const leadEtapa2Schema = z.object({
  marca_veiculo: z.string().min(1, 'Informe a marca'),
  modelo_veiculo: z.string().min(1, 'Informe o modelo'),
  ano_veiculo: z
    .string()
    .regex(/^\d{4}$/, 'Ano inválido')
    .refine((v) => {
      const year = parseInt(v)
      return year >= 1950 && year <= new Date().getFullYear() + 1
    }, 'Ano inválido'),
  placa: z.string().optional(),
  cidade: z.string().min(2, 'Informe a cidade'),
  estado: z.string().length(2, 'Selecione o estado'),
})

export const leadCompletoSchema = leadEtapa1Schema.merge(leadEtapa2Schema)

export const atualizarStatusLeadSchema = z.object({
  status_lead: z.enum([
    'novo', 'em_analise', 'em_contato', 'validado', 'reprovado', 'duplicado', 'convertido',
  ]),
  observacoes: z.string().optional(),
})

export const atualizarPagamentoSchema = z.object({
  status_pagamento: z.enum([
    'nao_elegivel', 'elegivel', 'em_processamento', 'pago', 'cancelado',
  ]),
  valor: z.number().min(0).optional(),
  pix_chave: z.string().optional(),
  banco: z.string().optional(),
  observacoes: z.string().optional(),
  data_prevista: z.string().optional(),
})

export type CadastroIndicadorInput = z.infer<typeof cadastroIndicadorSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type EsqueciSenhaInput = z.infer<typeof esqueciSenhaSchema>
export type LeadEtapa1Input = z.infer<typeof leadEtapa1Schema>
export type LeadEtapa2Input = z.infer<typeof leadEtapa2Schema>
export type LeadCompletoInput = z.infer<typeof leadCompletoSchema>
