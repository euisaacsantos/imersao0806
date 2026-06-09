import { createClient } from '@supabase/supabase-js'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  return createClient(url, key)
}

export const supabase = {
  from: (...args: Parameters<ReturnType<typeof createClient>['from']>) =>
    getClient().from(...args),
}

export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Supabase service env vars not configured')
  return createClient(url, serviceKey)
}

export interface SaleRecord {
  id?: number
  sale_id: string
  value: number
  campaign_id: string | null
  adset_id: string | null
  ad_id: string | null
  payment_method?: string
  created_at?: string
}

function toError(e: unknown): Error {
  if (e instanceof Error) return e
  if (e && typeof e === 'object') {
    const obj = e as Record<string, unknown>
    const msg = (obj.message ?? obj.msg ?? JSON.stringify(e)) as string
    const err = new Error(msg)
    if (obj.code) (err as any).code = obj.code
    if (obj.details) (err as any).details = obj.details
    if (obj.hint) (err as any).hint = obj.hint
    return err
  }
  return new Error(String(e))
}

export async function insertSale(sale: Omit<SaleRecord, 'id' | 'created_at'>) {
  const client = getServiceSupabase()
  const { data, error } = await client
    .from('sales')
    .insert(sale)
    .select()
    .single()

  if (error) throw toError(error)
  return data
}

export async function getSalesByCampaign(campaignId: string) {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) throw toError(error)
  return data
}

export async function getSalesStats() {
  const { data, error } = await supabase
    .from('sales')
    .select('value, payment_method, campaign_id, adset_id, ad_id, created_at')

  if (error) throw toError(error)
  return data
}
