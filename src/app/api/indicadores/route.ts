import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: indicador, error } = await supabase
    .from('indicadores')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (error || !indicador) {
    return NextResponse.json({ error: 'Indicador não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ indicador })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()

  // Campos que o indicador NÃO pode editar diretamente
  const { cpf, referral_code, referral_link, auth_user_id, ...allowedFields } = body

  const { data, error } = await supabase
    .from('indicadores')
    .update(allowedFields)
    .eq('auth_user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })

  return NextResponse.json({ indicador: data })
}
