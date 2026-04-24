import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { leadCompletoSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = leadCompletoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const supabase = await createClient()

    // Checar duplicidade no servidor (não confiamos na checagem do associado)
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .or(`cpf.eq.${data.cpf},email.eq.${data.email},telefone.eq.${data.telefone}`)
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um cadastro com esses dados.' },
        { status: 409 }
      )
    }

    // Buscar indicador pelo referral_code
    let indicadorId: string | null = null
    if (body.referral_code) {
      const { data: indicador } = await supabase
        .from('indicadores')
        .select('id')
        .eq('referral_code', body.referral_code)
        .eq('status', 'ativo')
        .single()
      indicadorId = indicador?.id ?? null
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        indicador_id: indicadorId,
        referral_code: body.referral_code ?? null,
        ...data,
      })
      .select()
      .single()

    if (error) {
      // Violação de unique constraint (inserção concorrente)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Já existe um cadastro com esses dados.' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Erro ao registrar lead.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, lead }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
