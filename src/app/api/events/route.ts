import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_EVENTS = [
  'link_copiado',
  'visita_link',
  'lead_cadastrado',
  'whatsapp_iniciado',
  'status_atualizado',
  'associado_confirmado',
  'comissao_gerada',
  'comissao_paga',
] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event_type, lead_id, indicador_id, metadata } = body

    if (!event_type || !ALLOWED_EVENTS.includes(event_type)) {
      return NextResponse.json({ error: 'event_type inválido' }, { status: 400 })
    }

    const supabase = await createClient()

    // Se tiver lead_id, buscar o indicator_id automaticamente se não fornecido
    let resolvedIndicatorId = indicador_id ?? null
    if (lead_id && !resolvedIndicatorId) {
      const { data: lead } = await supabase
        .from('referral_leads')
        .select('indicator_id')
        .eq('id', lead_id)
        .single()
      resolvedIndicatorId = lead?.indicator_id ?? null
    }

    await supabase.from('referral_events').insert({
      indicator_id: resolvedIndicatorId,
      lead_id: lead_id ?? null,
      event_type: event_type,
      metadata: metadata ?? null,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
