import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            )
          },
        },
      }
    )

    console.log('Iniciando exchangeCodeForSession...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Erro no exchangeCodeForSession:', error)
      return NextResponse.redirect(`${origin}/login?error=exchange_error`)
    }

    if (data.user) {
      console.log('Usuário autenticado:', data.user.email)
      // Verificar se é admin
      try {
        const { data: admin, error: adminError } = await supabase
          .from('administradores')
          .select('id')
          .eq('auth_user_id', data.user.id)
          .single()
        
        if (adminError && adminError.code !== 'PGRST116') {
          console.error('Erro ao consultar administradores:', adminError)
        }

        const redirectTo = admin ? '/admin' : '/painel'
        console.log('Redirecionando para:', redirectTo)
        return NextResponse.redirect(`${origin}${redirectTo}`)
      } catch (err) {
        console.error('Erro inesperado na verificação de admin:', err)
        return NextResponse.redirect(`${origin}/painel`)
      }
    }
  }

  console.warn('Callback falhou: sem código ou usuário')
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
