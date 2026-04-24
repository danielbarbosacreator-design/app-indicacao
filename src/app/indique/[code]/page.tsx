'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, ChevronRight, ChevronLeft, Car, User, Shield } from 'lucide-react'
import {
  leadEtapa1Schema,
  leadEtapa2Schema,
  type LeadEtapa1Input,
  type LeadEtapa2Input,
} from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatCPF, formatPhone, formatCPFInput, formatPhoneInput } from '@/lib/utils'

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
].map((uf) => ({ value: uf, label: uf }))

const ANOS = Array.from({ length: 40 }, (_, i) => {
  const year = new Date().getFullYear() + 1 - i
  return { value: String(year), label: String(year) }
})

type Etapa = 1 | 2 | 3

export default function LeadCapturePage() {
  const params = useParams<{ code: string }>()
  const code = params.code?.toUpperCase()

  const [etapa, setEtapa] = useState<Etapa>(1)
  const [etapa1Data, setEtapa1Data] = useState<LeadEtapa1Input | null>(null)
  const [etapa2Data, setEtapa2Data] = useState<LeadEtapa2Input | null>(null)
  const [indicadorNome, setIndicadorNome] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [codeValid, setCodeValid] = useState<boolean | null>(null)

  const form1 = useForm<LeadEtapa1Input>({ resolver: zodResolver(leadEtapa1Schema) })
  const form2 = useForm<LeadEtapa2Input>({ resolver: zodResolver(leadEtapa2Schema) })

  useEffect(() => {
    if (!code) return

    async function validateAndTrack() {
      try {
        // Evita registrar múltiplos cliques por refresh na mesma sessão
        const sessionKey = `ref_click_${code}`
        const alreadyCounted = sessionStorage.getItem(sessionKey)
        const url = `/api/referral/validate?code=${code}${alreadyCounted ? '&no_track=1' : ''}`

        const res = await fetch(url, { headers: { Referer: document.referrer } })
        const json = await res.json()
        if (!json.valid) {
          setCodeValid(false)
          return
        }
        if (!alreadyCounted) {
          sessionStorage.setItem(sessionKey, '1')
        }
        setCodeValid(true)
        setIndicadorNome(json.indicador_nome || '')
      } catch {
        setCodeValid(false)
      }
    }

    validateAndTrack()
  }, [code])

  // Etapa 1: validar dados pessoais
  async function handleEtapa1(data: LeadEtapa1Input) {
    setError('')
    const normalizedCPF = data.cpf.replace(/\D/g, '')
    const normalizedPhone = data.telefone.replace(/\D/g, '')
    setEtapa1Data({ ...data, cpf: normalizedCPF, telefone: normalizedPhone })
    setEtapa(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Etapa 2: validar e salvar dados do veículo
  function handleEtapa2(data: LeadEtapa2Input) {
    setError('')
    setEtapa2Data(data)
    setEtapa(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Etapa 3: enviar para API (validação e insert no servidor)
  async function handleConfirm() {
    if (!etapa1Data || !etapa2Data) return
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referral_code: code,
          nome: etapa1Data.nome,
          cpf: etapa1Data.cpf,
          telefone: etapa1Data.telefone,
          email: etapa1Data.email,
          marca_veiculo: etapa2Data.marca_veiculo,
          modelo_veiculo: etapa2Data.modelo_veiculo,
          ano_veiculo: etapa2Data.ano_veiculo,
          placa: etapa2Data.placa || null,
          cidade: etapa2Data.cidade,
          estado: etapa2Data.estado,
        }),
      })

      if (!response.ok) {
        const body = await response.json()
        if (response.status === 409) {
          setError(
            'Já existe um cadastro com esse CPF, e-mail ou telefone. ' +
            'Entre em contato com a Auto Excelência para mais informações.'
          )
        } else {
          setError(body.error || 'Erro ao enviar cadastro. Por favor, tente novamente.')
        }
        setSubmitting(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Erro ao enviar cadastro. Verifique sua conexão e tente novamente.')
    }
    setSubmitting(false)
  }

  // Loading enquanto valida o código
  if (codeValid === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500">Verificando link de indicação...</p>
        </div>
      </div>
    )
  }

  // Link inválido
  if (codeValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link inválido</h1>
          <p className="text-gray-500 text-sm">
            Este link de indicação não é válido ou está inativo. Solicite um novo link ao seu indicador.
          </p>
        </div>
      </div>
    )
  }

  // Sucesso
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Cadastro realizado!</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Recebemos seus dados com sucesso. Nossa equipe entrará em contato em breve para
            apresentar as melhores opções de proteção veicular para você.
          </p>
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5 text-sm text-gray-500 text-left">
            <p className="font-semibold text-gray-700 mb-3">O que acontece agora?</p>
            <ul className="space-y-2">
              {[
                'Seus dados foram registrados com segurança',
                'Nossa equipe analisará seu perfil',
                'Entraremos em contato pelo WhatsApp ou e-mail em até 48h',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { n: 1, label: 'Dados pessoais', icon: User },
    { n: 2, label: 'Veículo', icon: Car },
    { n: 3, label: 'Confirmação', icon: CheckCircle },
  ]

  const { onChange: onCPFChange, ...cpfRest } = form1.register('cpf')
  const { onChange: onPhoneChange, ...phoneRest } = form1.register('telefone')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="font-bold text-xs">AE</span>
            </div>
            <span className="font-semibold text-sm">Auto Excelência</span>
          </div>
          <h1 className="text-xl font-bold mb-1">Solicitar proteção veicular</h1>
          {indicadorNome && (
            <p className="text-sm text-gray-300">
              Indicado por: <span className="text-white font-medium">{indicadorNome}</span>
            </p>
          )}
        </div>

        {/* Steps */}
        <div className="max-w-2xl mx-auto px-4 pb-5">
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <div key={step.n} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                    etapa > step.n
                      ? 'bg-red-600 text-white'
                      : etapa === step.n
                      ? 'bg-white text-black'
                      : 'bg-white/20 text-white/50'
                  }`}
                >
                  {etapa > step.n ? <CheckCircle size={14} /> : step.n}
                </div>
                <span
                  className={`text-xs hidden sm:block ${
                    etapa >= step.n ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {step.label}
                </span>
                {idx < steps.length - 1 && (
                  <div
                    className={`hidden sm:block flex-1 h-px w-10 ${
                      etapa > step.n ? 'bg-red-500' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── ETAPA 1: Dados pessoais ── */}
        {etapa === 1 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Seus dados pessoais</h2>
            <p className="text-sm text-gray-500 mb-6">
              Preencha seus dados para que nossa equipe possa entrar em contato.
            </p>

            <form onSubmit={form1.handleSubmit(handleEtapa1)} className="space-y-4">
              <Input
                label="Nome completo"
                placeholder="Seu nome completo"
                error={form1.formState.errors.nome?.message}
                required
                {...form1.register('nome')}
              />
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                error={form1.formState.errors.cpf?.message}
                required
                {...cpfRest}
                onChange={(e) => {
                  e.target.value = formatCPFInput(e.target.value)
                  onCPFChange(e)
                }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Telefone/WhatsApp"
                  placeholder="(11) 99999-9999"
                  error={form1.formState.errors.telefone?.message}
                  required
                  {...phoneRest}
                  onChange={(e) => {
                    e.target.value = formatPhoneInput(e.target.value)
                    onPhoneChange(e)
                  }}
                />
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  error={form1.formState.errors.email?.message}
                  required
                  {...form1.register('email')}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-3 leading-relaxed">
                  {error}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={form1.formState.isSubmitting}>
                  Próximo
                  <ChevronRight size={16} />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── ETAPA 2: Dados do veículo ── */}
        {etapa === 2 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Dados do veículo</h2>
            <p className="text-sm text-gray-500 mb-6">
              Informe os dados do veículo que deseja proteger.
            </p>

            <form onSubmit={form2.handleSubmit(handleEtapa2)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Marca"
                  placeholder="Ex: Toyota, Honda, VW..."
                  error={form2.formState.errors.marca_veiculo?.message}
                  required
                  {...form2.register('marca_veiculo')}
                />
                <Input
                  label="Modelo"
                  placeholder="Ex: Corolla, Civic..."
                  error={form2.formState.errors.modelo_veiculo?.message}
                  required
                  {...form2.register('modelo_veiculo')}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Ano"
                  options={ANOS}
                  placeholder="Selecione..."
                  error={form2.formState.errors.ano_veiculo?.message}
                  required
                  {...form2.register('ano_veiculo')}
                />
                <Input
                  label="Placa (opcional)"
                  placeholder="ABC-1234"
                  error={form2.formState.errors.placa?.message}
                  {...form2.register('placa')}
                />
                <Select
                  label="Estado"
                  options={ESTADOS}
                  placeholder="UF..."
                  error={form2.formState.errors.estado?.message}
                  required
                  {...form2.register('estado')}
                />
              </div>
              <Input
                label="Cidade"
                placeholder="Sua cidade"
                error={form2.formState.errors.cidade?.message}
                required
                {...form2.register('cidade')}
              />

              <div className="flex justify-between pt-2">
                <Button type="button" variant="ghost" onClick={() => setEtapa(1)}>
                  <ChevronLeft size={16} />
                  Voltar
                </Button>
                <Button type="submit">
                  Revisar cadastro
                  <ChevronRight size={16} />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── ETAPA 3: Confirmação ── */}
        {etapa === 3 && etapa1Data && etapa2Data && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Revise e confirme</h2>
            <p className="text-sm text-gray-500 mb-6">
              Confira seus dados antes de enviar. Após a confirmação, nossa equipe entrará em
              contato.
            </p>

            {/* Resumo dados pessoais */}
            <div className="bg-gray-50 rounded-xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-red-600" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Dados pessoais
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Nome</p>
                  <p className="font-medium text-gray-900">{etapa1Data.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">CPF</p>
                  <p className="font-medium text-gray-900">{formatCPF(etapa1Data.cpf)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Telefone</p>
                  <p className="font-medium text-gray-900">{formatPhone(etapa1Data.telefone)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">E-mail</p>
                  <p className="font-medium text-gray-900">{etapa1Data.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEtapa(1)}
                className="text-xs text-red-600 hover:underline mt-3"
              >
                Editar dados pessoais
              </button>
            </div>

            {/* Resumo dados do veículo */}
            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Car size={16} className="text-red-600" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Veículo
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Marca</p>
                  <p className="font-medium text-gray-900">{etapa2Data.marca_veiculo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Modelo</p>
                  <p className="font-medium text-gray-900">{etapa2Data.modelo_veiculo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Ano</p>
                  <p className="font-medium text-gray-900">{etapa2Data.ano_veiculo}</p>
                </div>
                {etapa2Data.placa && (
                  <div>
                    <p className="text-xs text-gray-400">Placa</p>
                    <p className="font-medium text-gray-900">{etapa2Data.placa}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">Cidade/UF</p>
                  <p className="font-medium text-gray-900">
                    {etapa2Data.cidade}/{etapa2Data.estado}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEtapa(2)}
                className="text-xs text-red-600 hover:underline mt-3"
              >
                Editar dados do veículo
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-3 mb-4 leading-relaxed">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 text-xs text-blue-700 leading-relaxed">
              Ao confirmar, seus dados serão enviados à Auto Excelência. Nossa equipe entrará em
              contato em até 48 horas úteis.
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setEtapa(2)}>
                <ChevronLeft size={16} />
                Voltar
              </Button>
              <Button
                onClick={handleConfirm}
                loading={submitting}
                variant="secondary"
                size="lg"
              >
                <CheckCircle size={16} />
                Confirmar cadastro
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Seus dados são protegidos conforme a LGPD.{' '}
          <a href="/privacidade" className="text-red-600 hover:underline">
            Política de privacidade
          </a>
        </p>
      </div>
    </div>
  )
}
