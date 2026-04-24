'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { esqueciSenhaSchema, type EsqueciSenhaInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function EsqueciSenhaPage() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EsqueciSenhaInput>({ resolver: zodResolver(esqueciSenhaSchema) })

  async function onSubmit(data: EsqueciSenhaInput) {
    setServerError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })

    if (error) {
      setServerError('Erro ao enviar o e-mail. Verifique o endereço informado.')
      return
    }

    setSent(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 block">
          <div className="w-40 h-16 mx-auto">
            <img
              src="/logo.png"
              alt="Auto Excelência Logo"
              className="object-contain w-full h-full"
            />
          </div>
        </Link>

        {sent ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">E-mail enviado!</h1>
            <p className="text-gray-500 text-sm mb-1">
              Enviamos as instruções de redefinição para:
            </p>
            <p className="font-medium text-gray-800 text-sm mb-6">{getValues('email')}</p>
            <p className="text-xs text-gray-400 mb-6">
              Verifique sua caixa de entrada e pasta de spam. O link expira em 1 hora.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft size={16} />
                Voltar para o login
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Esqueceu a senha?</h1>
            <p className="text-gray-500 text-sm mb-6">
              Informe seu e-mail e enviaremos as instruções para redefinir sua senha.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="E-mail cadastrado"
                type="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                required
                {...register('email')}
              />

              {serverError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {serverError}
                </div>
              )}

              <Button type="submit" className="w-full" loading={isSubmitting}>
                Enviar instruções
              </Button>
            </form>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1 mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={14} />
              Voltar para o login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
