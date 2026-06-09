import { createClient } from '@supabase/supabase-js'

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service env vars não configurados')
  return createClient(url, key)
}

export function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function getSalesTotals(): Promise<{ count: number; revenue: number }> {
  const { data, error } = await client()
    .from('sales')
    .select('value')

  if (error) throw new Error(error.message)
  return {
    count: data.length,
    revenue: data.reduce((s, r) => s + parseFloat(r.value), 0),
  }
}

export async function getSalesByPaymentMethod() {
  const { data, error } = await client()
    .from('sales')
    .select('payment_method, value')

  if (error) throw new Error(error.message)

  const colors: Record<string, string> = {
    pix: '#ff6500',
    credit_card: '#ff8c42',
    boleto: '#ffb380',
    debit_card: '#ffd4b8',
    other: '#888888',
  }
  const labels: Record<string, string> = {
    pix: 'PIX',
    credit_card: 'Cartão Crédito',
    boleto: 'Boleto',
    debit_card: 'Cartão Débito',
    other: 'Outro',
  }

  const map: Record<string, { count: number; revenue: number }> = {}
  for (const r of data) {
    const pm = r.payment_method ?? 'other'
    if (!map[pm]) map[pm] = { count: 0, revenue: 0 }
    map[pm].count++
    map[pm].revenue += parseFloat(r.value)
  }

  const total = data.length || 1
  return Object.entries(map)
    .map(([pm, s]) => ({
      name: labels[pm] ?? pm,
      value: Math.round((s.count / total) * 100),
      count: s.count,
      color: colors[pm] ?? '#888',
    }))
    .sort((a, b) => b.count - a.count)
}

export async function getSalesByHour() {
  const { data, error } = await client()
    .from('sales')
    .select('value, created_at')

  if (error) throw new Error(error.message)

  const map: Record<number, { sales: number; revenue: number }> = {}
  for (let h = 0; h < 24; h++) map[h] = { sales: 0, revenue: 0 }

  for (const r of data) {
    const d = new Date(r.created_at)
    // UTC-3 (Brasília)
    const hour = (d.getUTCHours() + 21) % 24
    map[hour].sales++
    map[hour].revenue += parseFloat(r.value)
  }

  return Object.entries(map).map(([h, v]) => ({
    hour: `${String(h).padStart(2, '0')}h`,
    sales: v.sales,
    revenue: v.revenue,
  }))
}

export async function getSalesByEntity(): Promise<{
  byCampaign: Record<string, { count: number; revenue: number }>
  byAdset: Record<string, { count: number; revenue: number }>
  byAd: Record<string, { count: number; revenue: number }>
}> {
  const { data, error } = await client()
    .from('sales')
    .select('value, campaign_id, adset_id, ad_id')

  if (error) throw new Error(error.message)

  const byCampaign: Record<string, { count: number; revenue: number }> = {}
  const byAdset: Record<string, { count: number; revenue: number }> = {}
  const byAd: Record<string, { count: number; revenue: number }> = {}

  for (const r of data) {
    const v = parseFloat(r.value)

    if (r.campaign_id) {
      if (!byCampaign[r.campaign_id]) byCampaign[r.campaign_id] = { count: 0, revenue: 0 }
      byCampaign[r.campaign_id].count++
      byCampaign[r.campaign_id].revenue += v
    }
    if (r.adset_id) {
      if (!byAdset[r.adset_id]) byAdset[r.adset_id] = { count: 0, revenue: 0 }
      byAdset[r.adset_id].count++
      byAdset[r.adset_id].revenue += v
    }
    if (r.ad_id) {
      if (!byAd[r.ad_id]) byAd[r.ad_id] = { count: 0, revenue: 0 }
      byAd[r.ad_id].count++
      byAd[r.ad_id].revenue += v
    }
  }

  return { byCampaign, byAdset, byAd }
}
