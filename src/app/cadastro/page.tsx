'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, CheckCircle, Shield, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cadastroIndicadorSchema, type CadastroIndicadorInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatCPFInput, formatPhoneInput } from '@/lib/utils'

const PIX_OPTIONS = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'chave_aleatoria', label: 'Chave aleatória' },
]

export default function CadastroPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successState, setSuccessState] = useState<'idle' | 'email_check' | 'redirect'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroIndicadorInput>({
    resolver: zodResolver(cadastroIndicadorSchema),
  })

  const { onChange: onCPFChange, ...cpfRest } = register('cpf')
  const { onChange: onPhoneChange, ...phoneRest } = register('telefone')

  async function onSubmit(data: CadastroIndicadorInput) {
    setServerError('')
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
      options: {
        data: {
          full_name: data.nome,
          phone: data.telefone.replace(/\D/g, ''),
          cpf: data.cpf.replace(/\D/g, ''),
        },
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        setServerError('Este e-mail já está cadastrado. Acesse com sua senha ou recupere-a.')
      } else {
        setServerError('Erro ao criar conta. Tente novamente.')
      }
      return
    }

    if (!authData.user) {
      setServerError('Erro inesperado ao criar conta. Tente novamente.')
      return
    }

    // Salvar dados PIX — aguarda o trigger criar o registro de indicador
    if (data.pix_tipo || data.banco) {
      let saved = false
      for (let attempt = 0; attempt < 5; attempt++) {
        await new Promise((r) => setTimeout(r, attempt === 0 ? 600 : 800))
        const { error } = await supabase
          .from('indicadores')
          .update({
            pix_tipo: data.pix_tipo || null,
            pix_chave: data.pix_chave || null,
            banco: data.banco || null,
          })
          .eq('auth_user_id', authData.user.id)
        if (!error) { saved = true; break }
      }
      // Não bloqueia o fluxo se não conseguir salvar o PIX — usuário pode completar no perfil
      void saved
    }

    // Se há sessão ativa, o usuário já está logado (sem confirmação de email)
    if (authData.session) {
      setSuccessState('redirect')
      setTimeout(() => router.push('/painel'), 1500)
    } else {
      // Email de confirmação enviado — informar ao usuário
      setSuccessState('email_check')
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  if (successState === 'redirect') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Conta criada com sucesso!</h2>
          <p className="text-gray-500 text-sm">Redirecionando para o seu painel...</p>
        </div>
      </div>
    )
  }

  if (successState === 'email_check') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Confirme seu e-mail</h2>
          <p className="text-gray-500 text-sm mb-4">
            Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua conta
            e acessar o painel.
          </p>
          <p className="text-xs text-gray-400">Verifique também a caixa de spam.</p>
          <div className="mt-6">
            <Link href="/login" className="text-sm text-brand-600 hover:underline font-medium">
              Já confirmei — ir para o login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Painel lateral (desktop) */}
      <div className="hidden lg:flex w-96 bg-brand-700 flex-col justify-between p-10 text-white">
        <div>
          <Link href="/" className="mb-12 block">
            <div className="w-40 h-16">
              <img
                src="/logo.png"
                alt="Auto Excelência Logo"
                className="object-contain w-full h-full filter brightness-0 invert"
              />
            </div>
          </Link>
          <h2 className="text-2xl font-bold mb-3">Crie sua conta</h2>
          <p className="text-brand-200 text-sm leading-relaxed mb-8">
            Cadastre-se gratuitamente e comece a indicar hoje mesmo. Receba{' '}
            <span className="text-white font-semibold text-base">R$ 200,00</span> por cada cliente
            aprovado.
          </p>
          <ul className="space-y-3">
            {[
              'Cadastro 100% gratuito',
              'Link exclusivo gerado automaticamente',
              'Painel completo para acompanhar indicações',
              'Receba via Pix',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-brand-100">
                <CheckCircle size={16} className="text-gold-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/10 rounded-xl p-5">
          <Shield size={24} className="text-gold-400 mb-3" />
          <p className="text-sm font-medium mb-1">Seus dados estão seguros</p>
          <p className="text-xs text-brand-200">
            Todas as informações são criptografadas e protegidas conforme a LGPD.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 block lg:hidden">
            <div className="w-32 h-12">
              <img
                src="/logo.png"
                alt="Auto Excelência Logo"
                className="object-contain w-full h-full"
              />
            </div>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Criar conta de indicador</h1>
          <p className="text-gray-500 text-sm mb-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">
              Entrar
            </Link>
          </p>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-5 border-gray-300"
            onClick={handleGoogleLogin}
            loading={googleLoading}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Cadastrar com Google
          </Button>

          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">ou preencha o formulário</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Dados pessoais
            </p>

            <Input
              label="Nome completo"
              placeholder="Seu nome completo"
              error={errors.nome?.message}
              required
              {...register('nome')}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                error={errors.email?.message}
                required
                {...register('email')}
              />
              <Input
                label="Telefone/WhatsApp"
                placeholder="(11) 99999-9999"
                error={errors.telefone?.message}
                required
                {...phoneRest}
                onChange={(e) => {
                  e.target.value = formatPhoneInput(e.target.value)
                  onPhoneChange(e)
                }}
              />
            </div>

            <Input
              label="CPF"
              placeholder="000.000.000-00"
              error={errors.cpf?.message}
              required
              {...cpfRest}
              onChange={(e) => {
                e.target.value = formatCPFInput(e.target.value)
                onCPFChange(e)
              }}
            />

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">
              Dados para recebimento (opcional)
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Tipo de chave Pix"
                options={PIX_OPTIONS}
                placeholder="Selecione..."
                error={errors.pix_tipo?.message}
                {...register('pix_tipo')}
              />
              <Input
                label="Chave Pix"
                placeholder="Sua chave Pix"
                error={errors.pix_chave?.message}
                {...register('pix_chave')}
              />
            </div>

            <Input
              label="Banco"
              placeholder="Nome do banco"
              error={errors.banco?.message}
              {...register('banco')}
            />

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">
              Senha de acesso
            </p>

            <div>
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                error={errors.senha?.message}
                required
                {...register('senha')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1"
              >
                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPassword ? 'Ocultar' : 'Mostrar'} senha
              </button>
            </div>

            <div>
              <Input
                label="Confirmar senha"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repita a senha"
                autoComplete="new-password"
                error={errors.confirmar_senha?.message}
                required
                {...register('confirmar_senha')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1"
              >
                {showConfirm ? <EyeOff size={12} /> : <Eye size={12} />}
                {showConfirm ? 'Ocultar' : 'Mostrar'} confirmação
              </button>
            </div>

            {serverError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {serverError}
              </div>
            )}

            <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
              Criar conta gratuita
            </Button>

            <p className="text-xs text-gray-400 text-center">
              Ao criar sua conta, você concorda com os{' '}
              <a href="/termos" className="text-brand-600 hover:underline">
                Termos de Uso
              </a>{' '}
              e a{' '}
              <a href="/privacidade" className="text-brand-600 hover:underline">
                Política de Privacidade
              </a>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
