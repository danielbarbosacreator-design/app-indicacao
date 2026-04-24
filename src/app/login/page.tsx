'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    setServerError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.senha,
    })

    if (error) {
      setServerError('E-mail ou senha incorretos. Verifique seus dados.')
      return
    }

    // Verificar se é admin
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: admin } = await supabase
        .from('administradores')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      router.push(admin ? '/admin' : '/painel')
      router.refresh()
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setServerError('')

    // Timeout de segurança: se em 10s não redirecionar, mostra erro
    const timeout = setTimeout(() => {
      setGoogleLoading(false)
      setServerError('Não foi possível conectar com o Google. Verifique sua conexão e tente novamente.')
    }, 10000)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      console.log('[Google OAuth] data:', data)
      console.log('[Google OAuth] error:', error)

      if (error) {
        clearTimeout(timeout)
        setServerError('Erro ao autenticar com Google: ' + error.message)
        setGoogleLoading(false)
        return
      }

      if (!data?.url) {
        clearTimeout(timeout)
        setServerError('Provedor Google não configurado. Entre em contato com o suporte.')
        setGoogleLoading(false)
        return
      }

      // Redirecionar para a URL do Google OAuth
      clearTimeout(timeout)
      window.location.href = data.url
    } catch (err) {
      clearTimeout(timeout)
      setServerError('Erro inesperado ao conectar com Google.')
      setGoogleLoading(false)
      console.error('[Google OAuth] catch:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Painel lateral (desktop) */}
      <div className="hidden lg:flex w-96 bg-black flex-col justify-between p-10 text-white">
        <div>
          <Link href="/" className="mb-12 block">
            <div className="w-40 h-16">
              <img
                src="/assets/logo.png"
                alt="Auto Excelência Logo"
                className="object-contain w-full h-full filter brightness-0 invert"
              />
            </div>
          </Link>
          <h2 className="text-2xl font-bold mb-3">Bem-vindo de volta</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Acesse sua conta para acompanhar suas indicações e gerenciar seus ganhos.
          </p>
        </div>
        <div className="bg-white/10 rounded-xl p-5">
          <Shield size={24} className="text-red-500 mb-3" />
          <p className="text-sm font-medium mb-1">Programa seguro e confiável</p>
          <p className="text-xs text-gray-300">
            Suas informações são protegidas e suas indicações são rastreadas com precisão.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 block lg:hidden">
            <div className="w-32 h-12">
              <img
                src="/assets/logo.png"
                alt="Auto Excelência Logo"
                className="object-contain w-full h-full"
              />
            </div>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Entrar na conta</h1>
          <p className="text-gray-500 text-sm mb-8">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-red-600 font-medium hover:underline">
              Cadastre-se gratuitamente
            </Link>
          </p>

          {/* Google login */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-5 border-gray-300"
            onClick={handleGoogleLogin}
            loading={googleLoading}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Entrar com Google
          </Button>

          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">ou entre com e-mail</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <div>
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
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

            {serverError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {serverError}
              </div>
            )}

            <div className="flex items-center justify-end">
              <Link
                href="/esqueci-senha"
                className="text-sm text-red-600 hover:underline font-medium"
              >
                Esqueci minha senha
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
