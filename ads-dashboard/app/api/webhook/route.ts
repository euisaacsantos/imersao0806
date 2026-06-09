import { NextRequest, NextResponse } from 'next/server'
import { insertSale } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.WEBHOOK_SECRET
    if (secret) {
      const authHeader = req.headers.get('x-webhook-secret')
      if (authHeader !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await req.json()
    const { sale_id, value, campaign_id, adset_id, ad_id } = body

    if (!sale_id || value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Missing required fields: sale_id, value' },
        { status: 400 }
      )
    }

    if (typeof value !== 'number' || value < 0) {
      return NextResponse.json(
        { error: 'Field "value" must be a positive number' },
        { status: 400 }
      )
    }

    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY

    if (isSupabaseConfigured) {
      const record = await insertSale({
        sale_id: String(sale_id),
        value: Number(value),
        campaign_id: campaign_id ? String(campaign_id) : null,
        adset_id: adset_id ? String(adset_id) : null,
        ad_id: ad_id ? String(ad_id) : null,
      })

      return NextResponse.json(
        { success: true, message: 'Sale registered', data: record },
        { status: 201 }
      )
    }

    // Mock mode — Supabase not configured
    console.log('[WEBHOOK] Mock mode — sale received:', {
      sale_id,
      value,
      campaign_id,
      adset_id,
      ad_id,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Sale received (mock mode — Supabase not configured)',
        data: {
          sale_id,
          value,
          campaign_id: campaign_id ?? null,
          adset_id: adset_id ?? null,
          ad_id: ad_id ?? null,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[WEBHOOK] Error:', error)
    const e = error as any
    return NextResponse.json(
      {
        error: 'Internal server error',
        detail: e?.message ?? String(error),
        code: e?.code ?? null,
        hint: e?.hint ?? null,
        details: e?.details ?? null,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'POST /api/webhook',
    description: 'Registers a sale in Supabase',
    payload: {
      sale_id: 'string (required) — unique sale identifier',
      value: 'number (required) — sale value in BRL',
      campaign_id: 'string (optional) — Meta campaign ID',
      adset_id: 'string (optional) — Meta ad set ID',
      ad_id: 'string (optional) — Meta ad ID',
    },
    example: {
      sale_id: 'ORD-2024-00123',
      value: 197.0,
      campaign_id: '120210000000001',
      adset_id: '120210000000002',
      ad_id: '120210000000003',
    },
  })
}
