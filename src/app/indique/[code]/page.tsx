'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Car,
  User,
  Shield,
  MessageCircle,
  Star,
  Zap,
  Clock,
  Wrench,
  Phone,
  MapPin,
} from 'lucide-react'
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

const WHATSAPP_NUMBER = '5547991916070'
const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
].map((uf) => ({ value: uf, label: uf }))

const ANOS = Array.from({ length: 40 }, (_, i) => {
  const year = new Date().getFullYear() + 1 - i
  return { value: String(year), label: String(year) }
})

type Etapa = 1 | 2 | 3

export default function IndicacaoLandingPage() {
  const params = useParams<{ code: string }>()
  const code = params.code?.toUpperCase()
  const formRef = useRef<HTMLDivElement>(null)

  const [codeValid, setCodeValid] = useState<boolean | null>(null)
  const [indicadorNome, setIndicadorNome] = useState('')
  const [indicadorId, setIndicadorId] = useState('')

  // Form state
  const [etapa, setEtapa] = useState<Etapa>(1)
  const [etapa1Data, setEtapa1Data] = useState<LeadEtapa1Input | null>(null)
  const [etapa2Data, setEtapa2Data] = useState<LeadEtapa2Input | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const form1 = useForm<LeadEtapa1Input>({ resolver: zodResolver(leadEtapa1Schema) })
  const form2 = useForm<LeadEtapa2Input>({ resolver: zodResolver(leadEtapa2Schema) })
  const { onChange: onCPFChange, ...cpfRest } = form1.register('cpf')
  const { onChange: onPhoneChange, ...phoneRest } = form1.register('telefone')

  // Validate referral code and track visit
  useEffect(() => {
    if (!code) return
    async function validateAndTrack() {
      try {
        const sessionKey = `ref_click_${code}`
        const alreadyCounted = sessionStorage.getItem(sessionKey)
        const url = `/api/referral/validate?code=${code}${alreadyCounted ? '&no_track=1' : ''}`
        const res = await fetch(url, { headers: { Referer: document.referrer } })
        const json = await res.json()
        if (!json.valid) { setCodeValid(false); return }
        if (!alreadyCounted) sessionStorage.setItem(sessionKey, '1')
        setCodeValid(true)
        setIndicadorNome(json.indicador_nome || '')
        setIndicadorId(json.indicador_id || '')
      } catch {
        setCodeValid(false)
      }
    }
    validateAndTrack()
  }, [code])

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleEtapa1(data: LeadEtapa1Input) {
    setError('')
    setEtapa1Data({ ...data, cpf: data.cpf.replace(/\D/g, ''), telefone: data.telefone.replace(/\D/g, '') })
    setEtapa(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleEtapa2(data: LeadEtapa2Input) {
    setError('')
    setEtapa2Data(data)
    setEtapa(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
          setError('Já existe um cadastro com esse CPF, e-mail ou telefone. Entre em contato com a Auto Excelência.')
        } else {
          setError(body.error || 'Erro ao enviar cadastro. Tente novamente.')
        }
        setSubmitting(false)
        return
      }

      const body = await response.json()
      setLeadId(body.lead?.id ?? null)
      setSuccess(true)
    } catch {
      setError('Erro ao enviar cadastro. Verifique sua conexão e tente novamente.')
    }
    setSubmitting(false)
  }

  async function handleWhatsApp() {
    // Track WhatsApp click event
    if (leadId) {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'whatsapp_iniciado', lead_id: leadId }),
      }).catch(() => {})
    }

    const nomeParts = etapa1Data?.nome?.split(' ') ?? []
    const primeiroNome = nomeParts[0] ?? 'associado'
    const msgIndicador = indicadorNome ? `do indicador ${indicadorNome}` : 'de um indicador'
    const message =
      `Olá, vim através do link de indicação ${msgIndicador}. ` +
      `Já preenchi minhas informações e gostaria de me associar.`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  // ── LOADING ──────────────────────────────────────────────
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

  // ── INVALID CODE ─────────────────────────────────────────
  if (codeValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link inválido</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Este link de indicação não é válido ou está inativo. Solicite um novo link ao seu indicador.
          </p>
        </div>
      </div>
    )
  }

  // ── SUCCESS ───────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cadastro realizado!</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Recebemos seus dados. Agora, fale com nossa equipe pelo WhatsApp para
              finalizar seu cadastro como associado.
            </p>

            {/* WhatsApp CTA */}
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5b] active:bg-[#18a84e] text-white font-bold px-6 h-14 rounded-xl transition-colors text-base shadow-lg shadow-green-600/20"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar com a equipe no WhatsApp
            </button>

            <p className="text-xs text-gray-400 mt-4">
              Nosso atendimento responde em minutos durante o horário comercial.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-sm text-gray-500">
            <p className="font-semibold text-gray-700 mb-3">O que acontece agora?</p>
            <ul className="space-y-2.5">
              {[
                'Seus dados foram registrados com segurança',
                'Nossa equipe analisará seu perfil de proteção',
                'Você será contactado em até 48h por WhatsApp',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                  <span className="text-xs leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // ── FORM STEPS (modal-like overlay when triggered) ──────
  const isFormActive = etapa === 2 || etapa === 3 || (etapa === 1 && form1.formState.isSubmitted)

  const steps = [
    { n: 1, label: 'Dados pessoais', icon: User },
    { n: 2, label: 'Veículo', icon: Car },
    { n: 3, label: 'Confirmação', icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ─────────────────────────── */}
      <nav className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="Auto Excelência"
              className="h-8 object-contain brightness-0 invert"
            />
          </div>

          <div className="flex items-center gap-3">
            {indicadorNome && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Indicado por <span className="text-white font-medium">{indicadorNome}</span>
              </span>
            )}
            <button
              onClick={scrollToForm}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 h-9 rounded-lg text-sm transition-colors"
            >
              Seja um associado
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────── */}
      <section className="bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-transparent pointer-events-none" />
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-20 sm:py-28 relative z-10">
          <div className="max-w-2xl">
            {indicadorNome && (
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 text-sm text-gray-300 mb-6">
                <Star size={13} className="text-yellow-400 fill-yellow-400 shrink-0" />
                Indicado por <span className="text-white font-semibold ml-1">{indicadorNome}</span>
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
              Proteja seu veículo com quem{' '}
              <span className="text-red-500">entende de verdade</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-xl">
              A Auto Excelência oferece proteção veicular completa, com assistência 24h,
              atendimento humanizado e os melhores planos da região.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 h-14 rounded-xl transition-colors text-base shadow-lg shadow-red-600/20"
              >
                Seja um associado agora
                <ChevronRight size={18} />
              </button>
              <a
                href="#beneficios"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 h-14 rounded-xl transition-colors text-base"
              >
                Ver benefícios
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-5">
              100% seguro · Proteção completa · Atendimento humano
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────── */}
      <section className="bg-zinc-900 text-white border-y border-white/[0.06]">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-10">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: '+12.000', label: 'Associados ativos' },
              { value: '24h', label: 'Assistência disponível' },
              { value: '98%', label: 'Satisfação dos associados' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-2xl sm:text-3xl font-black text-white mb-1">{item.value}</p>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFÍCIOS ─────────────────────── */}
      <section id="beneficios" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">
              Por que escolher a Auto Excelência
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Proteção completa para seu veículo
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto">
              Mais de 12.000 associados confiam na nossa proteção todos os dias.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Shield,
                title: 'Proteção contra furto e roubo',
                desc: 'Cobertura completa para furto e roubo do veículo, sem burocracia na hora do sinistro.',
              },
              {
                icon: Clock,
                title: 'Assistência 24 horas',
                desc: 'Reboque, socorro mecânico, pane seca e muito mais — disponível 24h nos 7 dias da semana.',
              },
              {
                icon: Wrench,
                title: 'Cobertura de colisão',
                desc: 'Proteção para danos causados por acidentes, incluindo colisão com terceiros.',
              },
              {
                icon: Car,
                title: 'Carro reserva',
                desc: 'Em caso de sinistro, disponibilizamos um veículo reserva para você não parar.',
              },
              {
                icon: Phone,
                title: 'Atendimento humano',
                desc: 'Fale com pessoas reais. Sem robôs, sem filas intermináveis. Resolução ágil.',
              },
              {
                icon: MapPin,
                title: 'Cobertura regional completa',
                desc: 'Atendemos em toda a região com equipes especializadas prontas para agir.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                  <item.icon size={20} className="text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 h-12 sm:h-14 rounded-xl transition-colors text-base w-full sm:w-auto"
            >
              Quero ser associado
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ──────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">
              Simples e rápido
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Como virar um associado
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { num: '01', title: 'Preencha o formulário', desc: 'Informe seus dados e do veículo. Leva menos de 2 minutos.' },
              { num: '02', title: 'Nossa equipe entra em contato', desc: 'Analisamos seu perfil e apresentamos o melhor plano.' },
              { num: '03', title: 'Ative sua proteção', desc: 'Assine o plano e tenha proteção total imediata.' },
            ].map((item) => (
              <div key={item.num} className="text-center">
                <div className="text-5xl font-black text-red-100 mb-3 leading-none">{item.num}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ─────────────────────────── */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">
              Planos disponíveis
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Escolha a proteção ideal para você
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              Planos flexíveis pensados para o seu veículo e bolso.
              Nossa equipe ajuda você a escolher o ideal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                name: 'Essencial',
                tag: null,
                price: 'A partir de R$ 89/mês',
                items: [
                  'Proteção contra furto e roubo',
                  'Assistência 24h básica',
                  'Reboque até 100km',
                  'Atendimento humanizado',
                ],
              },
              {
                name: 'Completo',
                tag: 'Mais popular',
                price: 'A partir de R$ 149/mês',
                items: [
                  'Tudo do Essencial',
                  'Cobertura de colisão',
                  'Carro reserva por 5 dias',
                  'Reboque ilimitado',
                  'Terceiros incluído',
                ],
              },
              {
                name: 'Premium',
                tag: null,
                price: 'A partir de R$ 199/mês',
                items: [
                  'Tudo do Completo',
                  'Carro reserva por 15 dias',
                  'Cobertura nacional',
                  'Vidros e pneus',
                  'Assistência personalizada',
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl border p-6 sm:p-7 shadow-sm ${
                  plan.tag ? 'border-red-500 shadow-red-100 shadow-md' : 'border-gray-100'
                }`}
              >
                {plan.tag && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {plan.tag}
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm font-semibold text-red-600 mb-4">{plan.price}</p>
                <ul className="space-y-2 mb-6">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={scrollToForm}
                  className={`w-full h-10 rounded-xl font-semibold text-sm transition-colors ${
                    plan.tag
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Escolher este plano
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Valores são estimados. Nossa equipe apresenta uma proposta personalizada após o cadastro.
          </p>
        </div>
      </section>

      {/* ── FORMULÁRIO DE CADASTRO ─────────── */}
      <section
        id="formulario"
        ref={formRef}
        className="py-20 sm:py-28 bg-black scroll-mt-16"
      >
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          {/* Section header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600/30 text-red-400 rounded-full px-4 py-2 text-sm font-semibold mb-5">
              <Zap size={14} className="shrink-0" />
              Cadastro gratuito e sem compromisso
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Solicitar proteção veicular
            </h2>
            {indicadorNome && (
              <p className="text-gray-400 text-sm">
                Indicado por <span className="text-white font-medium">{indicadorNome}</span>
              </p>
            )}
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {steps.map((step, idx) => (
              <div key={step.n} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors shrink-0 ${
                  etapa > step.n ? 'bg-red-600 text-white' : etapa === step.n ? 'bg-white text-black' : 'bg-white/15 text-white/40'
                }`}>
                  {etapa > step.n ? <CheckCircle size={16} /> : step.n}
                </div>
                <span className={`text-xs hidden sm:block ${etapa >= step.n ? 'text-white' : 'text-white/30'}`}>
                  {step.label}
                </span>
                {idx < steps.length - 1 && (
                  <div className={`hidden sm:block w-8 h-px ${etapa > step.n ? 'bg-red-500' : 'bg-white/20'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8">

            {/* ETAPA 1: Dados pessoais */}
            {etapa === 1 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Seus dados pessoais</h3>
                <p className="text-sm text-gray-500 mb-6">Preencha para que nossa equipe possa entrar em contato.</p>
                <form onSubmit={form1.handleSubmit(handleEtapa1)} className="space-y-4">
                  <Input label="Nome completo" placeholder="Seu nome completo" error={form1.formState.errors.nome?.message} required {...form1.register('nome')} />
                  <Input label="CPF" placeholder="000.000.000-00" error={form1.formState.errors.cpf?.message} required {...cpfRest} onChange={(e) => { e.target.value = formatCPFInput(e.target.value); onCPFChange(e) }} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Telefone/WhatsApp" placeholder="(11) 99999-9999" error={form1.formState.errors.telefone?.message} required {...phoneRest} onChange={(e) => { e.target.value = formatPhoneInput(e.target.value); onPhoneChange(e) }} />
                    <Input label="E-mail" type="email" placeholder="seu@email.com" error={form1.formState.errors.email?.message} required {...form1.register('email')} />
                  </div>
                  {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-3">{error}</div>}
                  <div className="flex justify-end pt-2">
                    <Button type="submit" loading={form1.formState.isSubmitting}>
                      Próximo <ChevronRight size={16} />
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* ETAPA 2: Dados do veículo */}
            {etapa === 2 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Dados do veículo</h3>
                <p className="text-sm text-gray-500 mb-6">Informe os dados do veículo que deseja proteger.</p>
                <form onSubmit={form2.handleSubmit(handleEtapa2)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Marca" placeholder="Ex: Toyota, Honda, VW..." error={form2.formState.errors.marca_veiculo?.message} required {...form2.register('marca_veiculo')} />
                    <Input label="Modelo" placeholder="Ex: Corolla, Civic..." error={form2.formState.errors.modelo_veiculo?.message} required {...form2.register('modelo_veiculo')} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Select label="Ano" options={ANOS} placeholder="Selecione..." error={form2.formState.errors.ano_veiculo?.message} required {...form2.register('ano_veiculo')} />
                    <Input label="Placa (opcional)" placeholder="ABC-1234" error={form2.formState.errors.placa?.message} {...form2.register('placa')} />
                    <Select label="Estado" options={ESTADOS} placeholder="UF..." error={form2.formState.errors.estado?.message} required {...form2.register('estado')} />
                  </div>
                  <Input label="Cidade" placeholder="Sua cidade" error={form2.formState.errors.cidade?.message} required {...form2.register('cidade')} />
                  <div className="flex justify-between pt-2">
                    <Button type="button" variant="ghost" onClick={() => setEtapa(1)}><ChevronLeft size={16} /> Voltar</Button>
                    <Button type="submit">Revisar cadastro <ChevronRight size={16} /></Button>
                  </div>
                </form>
              </>
            )}

            {/* ETAPA 3: Confirmação */}
            {etapa === 3 && etapa1Data && etapa2Data && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Revise e confirme</h3>
                <p className="text-sm text-gray-500 mb-6">Confira seus dados antes de enviar.</p>

                <div className="bg-gray-50 rounded-xl p-4 sm:p-5 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User size={14} className="text-red-600" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dados pessoais</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-gray-400">Nome</p><p className="font-medium text-gray-900">{etapa1Data.nome}</p></div>
                    <div><p className="text-xs text-gray-400">CPF</p><p className="font-medium text-gray-900">{formatCPF(etapa1Data.cpf)}</p></div>
                    <div><p className="text-xs text-gray-400">Telefone</p><p className="font-medium text-gray-900">{formatPhone(etapa1Data.telefone)}</p></div>
                    <div><p className="text-xs text-gray-400">E-mail</p><p className="font-medium text-gray-900 truncate">{etapa1Data.email}</p></div>
                  </div>
                  <button type="button" onClick={() => setEtapa(1)} className="text-xs text-red-600 hover:underline mt-3">Editar dados pessoais</button>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 sm:p-5 mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Car size={14} className="text-red-600" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Veículo</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-gray-400">Marca</p><p className="font-medium text-gray-900">{etapa2Data.marca_veiculo}</p></div>
                    <div><p className="text-xs text-gray-400">Modelo</p><p className="font-medium text-gray-900">{etapa2Data.modelo_veiculo}</p></div>
                    <div><p className="text-xs text-gray-400">Ano</p><p className="font-medium text-gray-900">{etapa2Data.ano_veiculo}</p></div>
                    <div><p className="text-xs text-gray-400">Cidade/UF</p><p className="font-medium text-gray-900">{etapa2Data.cidade}/{etapa2Data.estado}</p></div>
                  </div>
                  <button type="button" onClick={() => setEtapa(2)} className="text-xs text-red-600 hover:underline mt-3">Editar dados do veículo</button>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-3 mb-4">{error}</div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700 leading-relaxed">
                  Ao confirmar, seus dados são enviados à Auto Excelência. Nossa equipe entrará em contato em até 48 horas.
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setEtapa(2)}><ChevronLeft size={16} /> Voltar</Button>
                  <Button onClick={handleConfirm} loading={submitting} variant="secondary" size="lg">
                    <CheckCircle size={16} /> Confirmar cadastro
                  </Button>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 mt-5">
            Seus dados são protegidos conforme a LGPD.{' '}
            <a href="/privacidade" className="text-red-400 hover:underline">Política de privacidade</a>
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────── */}
      <footer className="bg-zinc-950 text-gray-500 py-8">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/assets/logo.png" alt="Auto Excelência" className="h-7 object-contain brightness-0 invert opacity-50" />
          <p className="text-xs text-center sm:text-right">
            © {new Date().getFullYear()} Auto Excelência Proteção Veicular. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
