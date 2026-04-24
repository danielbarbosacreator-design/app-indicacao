'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, AlertTriangle, CheckCircle, Key } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ToastContainer } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { buildReferralLink, formatCPF, formatPhoneInput, formatDate } from '@/lib/utils'
import type { Indicador, PixTipo } from '@/types'

const PIX_OPTIONS = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'chave_aleatoria', label: 'Chave aleatória' },
]

interface PerfilClientProps {
  indicador: Indicador
}

export function PerfilClient({ indicador }: PerfilClientProps) {
  const router = useRouter()
  const { toasts, toast, removeToast } = useToast()

  const [nome, setNome] = useState(indicador.nome)
  const [telefone, setTelefone] = useState(indicador.telefone || '')
  const [pixTipo, setPixTipo] = useState<PixTipo | ''>(indicador.pix_tipo || '')
  const [pixChave, setPixChave] = useState(indicador.pix_chave || '')
  const [banco, setBanco] = useState(indicador.banco || '')
  const [saving, setSaving] = useState(false)

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmSenha, setConfirmSenha] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  async function handleSavePerfil() {
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('indicadores')
      .update({
        nome: nome.trim(),
        telefone: telefone.replace(/\D/g, ''),
        pix_tipo: pixTipo || null,
        pix_chave: pixChave.trim() || null,
        banco: banco.trim() || null,
      })
      .eq('id', indicador.id)

    if (error) {
      toast.error('Erro ao salvar alterações.')
    } else {
      toast.success('Perfil atualizado com sucesso.')
      router.refresh()
    }
    setSaving(false)
  }

  async function handleChangeSenha() {
    if (!senhaAtual) {
      toast.error('Informe a senha atual.')
      return
    }
    if (novaSenha.length < 8) {
      toast.error('A nova senha deve ter ao menos 8 caracteres.')
      return
    }
    if (novaSenha !== confirmSenha) {
      toast.error('As senhas não coincidem.')
      return
    }

    setChangingPw(true)
    const supabase = createClient()

    // Verifica a senha atual antes de trocar
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: indicador.email,
      password: senhaAtual,
    })

    if (signInError) {
      toast.error('Senha atual incorreta.')
      setChangingPw(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: novaSenha })

    if (error) {
      toast.error('Erro ao alterar senha. Tente novamente.')
    } else {
      toast.success('Senha alterada com sucesso.')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmSenha('')
    }
    setChangingPw(false)
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gerencie seus dados cadastrais e informações de pagamento.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Dados editáveis */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Dados cadastrais</h2>
            <div className="space-y-4">
              <Input
                label="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <Input
                label="Telefone/WhatsApp"
                value={telefone}
                onChange={(e) => setTelefone(formatPhoneInput(e.target.value))}
                placeholder="(11) 99999-9999"
              />

              <div className="pt-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Dados para recebimento via Pix
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Tipo de chave Pix"
                    options={PIX_OPTIONS}
                    placeholder="Selecione..."
                    value={pixTipo}
                    onChange={(e) => setPixTipo(e.target.value as PixTipo)}
                  />
                  <Input
                    label="Chave Pix"
                    value={pixChave}
                    onChange={(e) => setPixChave(e.target.value)}
                    placeholder="Sua chave Pix"
                  />
                </div>
                <div className="mt-3">
                  <Input
                    label="Banco"
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                    placeholder="Nome do banco"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSavePerfil} loading={saving}>
                  <CheckCircle size={15} />
                  Salvar alterações
                </Button>
              </div>
            </div>
          </div>

          {/* Alterar senha (somente para usuários com senha) */}
          {indicador.auth_provider === 'email' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Key size={18} className="text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900">Alterar senha</h2>
              </div>
              <div className="space-y-4">
                <Input
                  label="Senha atual"
                  type="password"
                  placeholder="Sua senha atual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  autoComplete="current-password"
                />
                <Input
                  label="Nova senha"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  autoComplete="new-password"
                />
                <Input
                  label="Confirmar nova senha"
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  autoComplete="new-password"
                />
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={handleChangeSenha}
                    loading={changingPw}
                  >
                    Alterar senha
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Coluna lateral */}
        <div className="space-y-4">
          {/* Dados imutáveis */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Dados da conta</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">E-mail</p>
                <p className="font-medium text-gray-900">{indicador.email}</p>
              </div>
              {indicador.cpf && (
                <div>
                  <p className="text-xs text-gray-400">CPF</p>
                  <p className="font-medium text-gray-900">{formatCPF(indicador.cpf)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400">Cadastrado em</p>
                <p className="font-medium text-gray-900">
                  {formatDate(indicador.created_at, 'dd/MM/yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Código de indicação</p>
                <p className="font-mono font-bold text-brand-700">{indicador.referral_code}</p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
              <AlertTriangle size={14} className="text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">
                E-mail e código de indicação não podem ser alterados. Fale com o suporte se
                precisar de ajuda.
              </p>
            </div>
          </div>

          {/* Link de indicação */}
          <div className="bg-brand-600 rounded-xl p-5 text-white">
            <p className="text-xs text-brand-200 mb-2 font-medium">Seu link de indicação</p>
            <p className="text-xs font-mono text-brand-100 break-all mb-3 leading-relaxed">
              {buildReferralLink(indicador.referral_code)}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(buildReferralLink(indicador.referral_code))
                toast.success('Link copiado!')
              }}
              className="text-xs font-medium text-white border border-white/30 rounded-lg px-3 py-1.5 hover:bg-white/20 transition-colors"
            >
              Copiar link
            </button>
          </div>

          {/* Segurança */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-green-500" />
              <p className="text-sm font-semibold text-gray-700">Segurança</p>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                Dados criptografados
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                Protegido por autenticação segura
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                Em conformidade com a LGPD
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
