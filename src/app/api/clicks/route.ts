import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referral_code, user_agent, source } = body

    if (!referral_code) {
      return NextResponse.json({ error: 'referral_code obrigatório' }, { status: 400 })
    }

    // Capturar IP real (respeita proxies como Vercel, Cloudflare)
    const ip =
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('cf-connecting-ip') ||
      null

    // Detectar device a partir do user-agent
    const ua = user_agent || request.headers.get('user-agent') || ''
    const device = /mobile|android|iphone|ipad/i.test(ua)
      ? 'mobile'
      : /tablet|ipad/i.test(ua)
      ? 'tablet'
      : 'desktop'

    const supabase = await createClient()

    const { data: indicador } = await supabase
      .from('indicadores')
      .select('id')
      .eq('referral_code', referral_code.toUpperCase())
      .eq('status', 'ativo')
      .single()

    await supabase.from('cliques_indicacao').insert({
      indicador_id: indicador?.id ?? null,
      referral_code: referral_code.toUpperCase(),
      ip,
      device,
      user_agent: ua || null,
      source: source || request.headers.get('referer') || null,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
