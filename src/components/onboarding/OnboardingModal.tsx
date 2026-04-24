'use client'

import { useState } from 'react'
import { CheckCircle, Copy, Share2, ArrowRight, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { formatPhoneInput, buildReferralLink } from '@/lib/utils'
import type { Indicador } from '@/types'

const PIX_OPTIONS = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'chave_aleatoria', label: 'Chave aleatória' },
]

interface OnboardingModalProps {
  indicador: Indicador
  onComplete: () => void
}

export function OnboardingModal({ indicador, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1)
  const [telefone, setTelefone] = useState(indicador.telefone || '')
  const [pixTipo, setPixTipo] = useState(indicador.pix_tipo || '')
  const [pixChave, setPixChave] = useState(indicador.pix_chave || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const referralLink = buildReferralLink(indicador.referral_code)

  // Progress: step 1 = welcome (hidden bar), 2 = 33%, 3 = 66%, 4 = 100%
  const progressMap: Record<number, number> = { 1: 0, 2: 33, 3: 66, 4: 100 }
  const progress = progressMap[step] ?? 0

  async function handleSaveProfile() {
    const newErrors: Record<string, string> = {}
    if (!telefone || telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Informe um telefone válido com DDD'
    }
    if (!pixTipo) {
      newErrors.pixTipo = 'Selecione o tipo de chave Pix'
    }
    if (!pixChave.trim()) {
      newErrors.pixChave = 'Informe sua chave Pix'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('indicadores')
        .update({
          telefone: telefone.replace(/\D/g, ''),
          pix_tipo: pixTipo,
          pix_chave: pixChave.trim(),
        })
        .eq('auth_user_id', user!.id)

      if (error) throw error
      setStep(3)
    } catch {
      setErrors({ general: 'Erro ao salvar. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback: select the text
    }
  }

  function handleWhatsApp() {
    const message =
      `Olá! Quero te apresentar a Auto Excelência, empresa especializada em proteção veicular. ` +
      `É seguro, sem burocracia e com cobertura completa. Faça seu cadastro: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden">

        {/* Progress bar — only from step 2 onward */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-black transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '0%' : `${progress}%` }}
          />
        </div>

        {/* ───────── STEP 1: Welcome ───────── */}
        {step === 1 && (
          <div className="px-8 py-10 text-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Zap size={28} className="text-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              R$200 por indicação aprovada
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
              Bem-vindo, {indicador.nome.split(' ')[0]}!
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Você está a poucos passos de começar a ganhar{' '}
              <span className="font-semibold text-gray-900">R$200 por indicação</span>.{' '}
              Leva menos de 1 minuto.
            </p>

            <Button className="w-full" size="lg" onClick={() => setStep(2)}>
              Começar agora
              <ArrowRight size={16} />
            </Button>
            <p className="text-xs text-gray-400 mt-3">Cadastro 100% gratuito · Pix automático</p>
          </div>
        )}

        {/* ───────── STEP 2: Complete profile ───────── */}
        {step === 2 && (
          <div className="px-8 py-8">
            <div className="mb-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Passo 1 de 2
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Finalize seu cadastro</h2>
            <p className="text-sm text-gray-500 mb-6">
              Falta só isso para{' '}
              <span className="font-semibold text-gray-800">começar a ganhar</span>
            </p>

            <div className="space-y-4">
              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Telefone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/20 focus:border-gray-900 transition-colors ${
                    errors.telefone ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => {
                    setTelefone(formatPhoneInput(e.target.value))
                    setErrors((prev) => ({ ...prev, telefone: '' }))
                  }}
                />
                {errors.telefone && (
                  <p className="text-xs text-red-500 mt-1">{errors.telefone}</p>
                )}
              </div>

              {/* PIX callout */}
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <span className="text-lg leading-none">💸</span>
                <p className="text-xs text-amber-800 font-medium leading-snug">
                  Informe sua chave Pix para receber os R$200 pelas suas indicações aprovadas.
                </p>
              </div>

              {/* PIX tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo de chave Pix <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/20 focus:border-gray-900 bg-white transition-colors ${
                    errors.pixTipo ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  value={pixTipo}
                  onChange={(e) => {
                    setPixTipo(e.target.value)
                    setErrors((prev) => ({ ...prev, pixTipo: '' }))
                  }}
                >
                  <option value="">Selecione...</option>
                  {PIX_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.pixTipo && (
                  <p className="text-xs text-red-500 mt-1">{errors.pixTipo}</p>
                )}
              </div>

              {/* PIX chave */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Chave Pix <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/20 focus:border-gray-900 transition-colors ${
                    errors.pixChave ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Informe sua chave Pix"
                  value={pixChave}
                  onChange={(e) => {
                    setPixChave(e.target.value)
                    setErrors((prev) => ({ ...prev, pixChave: '' }))
                  }}
                />
                {errors.pixChave && (
                  <p className="text-xs text-red-500 mt-1">{errors.pixChave}</p>
                )}
              </div>

              {errors.general && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {errors.general}
                </p>
              )}
            </div>

            <Button
              className="w-full mt-6"
              size="lg"
              loading={saving}
              onClick={handleSaveProfile}
            >
              Salvar e continuar
              <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* ───────── STEP 3: Share link ───────── */}
        {step === 3 && (
          <div className="px-8 py-8">
            <div className="mb-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Passo 2 de 2
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={20} className="text-green-500 shrink-0" />
              <h2 className="text-xl font-bold text-gray-900">Cadastro salvo!</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Seu link exclusivo está pronto. É por ele que identificamos suas indicações.
            </p>

            {/* Link display */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
              <p className="text-xs text-gray-400 font-medium mb-1.5 uppercase tracking-wide">
                Seu link de indicação
              </p>
              <p className="font-mono text-xs text-gray-800 break-all leading-relaxed">
                {referralLink}
              </p>
            </div>

            {/* Copy + Share */}
            <div className="flex gap-2 mb-6">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-1"
                size="md"
              >
                {copied ? (
                  <CheckCircle size={15} className="text-green-500" />
                ) : (
                  <Copy size={15} />
                )}
                {copied ? 'Copiado!' : 'Copiar link'}
              </Button>
              <Button
                onClick={handleWhatsApp}
                size="md"
                className="flex-1 bg-[#25D366] hover:bg-[#1ebe5b] border-0 text-white"
              >
                <Share2 size={15} />
                WhatsApp
              </Button>
            </div>

            <Button className="w-full" size="lg" onClick={() => setStep(4)}>
              Continuar
              <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* ───────── STEP 4: Activation ───────── */}
        {step === 4 && (
          <div className="px-8 py-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={28} className="text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Tudo pronto! 🎉</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Agora é simples:{' '}
              <span className="font-semibold text-gray-900">
                envie seu link para outras pessoas.
              </span>
              <br />
              Quando alguém se tornar um associado ativo, você recebe{' '}
              <span className="font-semibold text-gray-900">R$200 direto no Pix.</span>
            </p>

            {/* How it works */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { num: '1', text: 'Compartilhe o link' },
                { num: '2', text: 'Pessoa se associa' },
                { num: '3', text: 'Você recebe R$200' },
              ].map((item) => (
                <div key={item.num} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-2">
                    {item.num}
                  </div>
                  <p className="text-xs text-gray-600 font-medium leading-snug">{item.text}</p>
                </div>
              ))}
            </div>

            <Button className="w-full" size="lg" onClick={onComplete}>
              Ir para o painel
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
