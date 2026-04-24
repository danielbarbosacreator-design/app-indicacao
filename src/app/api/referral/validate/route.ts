import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')?.toUpperCase()

  if (!code) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: indicador } = await supabase
    .from('indicadores')
    .select('id, nome, status')
    .eq('referral_code', code)
    .single()

  if (!indicador || indicador.status !== 'ativo') {
    return NextResponse.json({ valid: false })
  }

  // Registrar clique apenas se não for supressão (evita dupla contagem por refresh)
  const noTrack = searchParams.get('no_track') === '1'
  if (!noTrack) {
    const ip =
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      null

    const ua = request.headers.get('user-agent') || ''
    const device = /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop'

    await supabase.from('cliques_indicacao').insert({
      indicador_id: indicador.id,
      referral_code: code,
      ip,
      device,
      user_agent: ua || null,
      source: request.headers.get('referer') || null,
    })
  }

  // Expõe apenas o primeiro nome por privacidade
  const primeiroNome = indicador.nome.split(' ')[0]

  return NextResponse.json({
    valid: true,
    indicador_nome: primeiroNome,
  })
}
