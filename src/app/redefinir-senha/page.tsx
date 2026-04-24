'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function RedefinirSenhaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState(false)

  useEffect(() => {
    // O Supabase envia um hash fragment com o token de recuperação
    // O SSR não pode ler #hash, então precisamos processar no cliente
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', ''))
      const accessToken = params.get('access_token')
      const type = params.get('type')

      if (accessToken && type === 'recovery') {
        const supabase = createClient()
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: params.get('refresh_token') || '',
        }).then(({ error }) => {
          if (error) {
            setSessionError(true)
          } else {
            setSessionReady(true)
          }
        })
      } else {
        setSessionError(true)
      }
    } else {
      // Verificar se já há sessão ativa (para o caso de redirecionar do callback)
      const supabase = createClient()
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setSessionReady(true)
        } else {
          setSessionError(true)
        }
      })
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('A senha deve ter ao menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('Erro ao redefinir senha. O link pode ter expirado. Solicite um novo link.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/login'), 2500)
  }

  if (sessionError) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-8 text-center max-w-md w-full">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Link expirado</h2>
        <p className="text-gray-500 text-sm mb-6">
          Este link de redefinição é inválido ou já expirou. Solicite um novo link de recuperação.
        </p>
        <Link href="/esqueci-senha">
          <Button className="w-full">Solicitar novo link</Button>
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-8 text-center max-w-md w-full">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Senha redefinida!</h2>
        <p className="text-gray-500 text-sm">Redirecionando para o login...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-8 max-w-md w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Redefinir senha</h1>
      <p className="text-gray-500 text-sm mb-6">
        Digite sua nova senha. Use ao menos 8 caracteres.
      </p>

      {!sessionReady ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full" />
          <span className="text-sm text-gray-500 ml-3">Verificando link...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Nova senha"
              type={showPw ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1"
            >
              {showPw ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPw ? 'Ocultar' : 'Mostrar'} senha
            </button>
          </div>

          <div>
            <Input
              label="Confirmar nova senha"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repita a nova senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
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

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading} size="lg">
            Redefinir senha
          </Button>
        </form>
      )}
    </div>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 flex items-center justify-center">
          <img
            src="/assets/logo.png"
            alt="Auto Excelência Logo"
            className="object-contain w-full h-full"
          />
        </div>
        <span className="font-semibold text-gray-900">Auto Excelência</span>
      </Link>
      <Suspense fallback={<div className="animate-pulse text-gray-400 text-sm">Carregando...</div>}>
        <RedefinirSenhaForm />
      </Suspense>
    </div>
  )
}
