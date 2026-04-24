import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { cpf, email, telefone } = await request.json()

    const supabase = await createClient()

    const normalizedCPF = cpf?.replace(/\D/g, '') || ''
    const normalizedPhone = telefone?.replace(/\D/g, '') || ''

    const filters = [
      normalizedCPF && `cpf.eq.${normalizedCPF}`,
      email && `email.eq.${email}`,
      normalizedPhone && `telefone.eq.${normalizedPhone}`,
    ]
      .filter(Boolean)
      .join(',')

    if (!filters) {
      return NextResponse.json({ duplicate: false })
    }

    const { data } = await supabase
      .from('leads')
      .select('id, status_lead')
      .or(filters)
      .limit(1)

    return NextResponse.json({
      duplicate: data && data.length > 0,
      existing_status: data?.[0]?.status_lead ?? null,
    })
  } catch {
    return NextResponse.json({ duplicate: false })
  }
}
