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

    // Se tiver lead_id, buscar o indicador_id automaticamente
    let resolvedIndicadorId = indicador_id ?? null
    if (lead_id && !resolvedIndicadorId) {
      const { data: lead } = await supabase
        .from('leads')
        .select('indicador_id')
        .eq('id', lead_id)
        .single()
      resolvedIndicadorId = lead?.indicador_id ?? null
    }

    await supabase.from('logs_sistema').insert({
      usuario_tipo: 'sistema',
      acao: event_type,
      entidade: lead_id ? 'lead' : 'indicador',
      entidade_id: lead_id ?? resolvedIndicadorId ?? null,
      descricao: `Evento: ${event_type}`,
      metadata: metadata ?? null,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
