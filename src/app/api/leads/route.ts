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

    // Checar duplicidade em referral_leads
    const { data: existing } = await supabase
      .from('referral_leads')
      .select('id')
      .or(`email.eq.${data.email},phone.eq.${data.telefone}`)
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um cadastro com esses dados.' },
        { status: 409 }
      )
    }

    // Buscar indicador pelo referral_code em indicators
    let indicatorId: string | null = null
    if (body.referral_code) {
      const { data: indicator } = await supabase
        .from('indicators')
        .select('id')
        .eq('referral_code', body.referral_code)
        .single()
      indicatorId = indicator?.id ?? null
    }

    const { data: lead, error } = await supabase
      .from('referral_leads')
      .insert({
        indicator_id: indicatorId,
        full_name: data.nome,
        email: data.email,
        phone: data.telefone,
        vehicle_type: data.marca_veiculo, -- mapeando marca como tipo no exemplo
        vehicle_model: data.modelo_veiculo,
        vehicle_year: data.ano_veiculo,
        vehicle_plate: data.placa || null,
        notes: `Estado: ${data.estado}, Cidade: ${data.cidade}`,
        status: 'lead_cadastrado'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erro ao registrar lead.' }, { status: 500 })
    }

    // Registrar o evento de lead_cadastrado
    await supabase.from('referral_events').insert({
      indicator_id: indicatorId,
      lead_id: lead.id,
      event_type: 'lead_cadastrado'
    })

    return NextResponse.json({ success: true, lead }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
