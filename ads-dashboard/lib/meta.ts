const BASE = 'https://graph.facebook.com/v21.0'

function tok() {
  const t = process.env.META_ACCESS_TOKEN
  if (!t) throw new Error('META_ACCESS_TOKEN não configurado')
  return t
}

function acc() {
  const a = process.env.META_AD_ACCOUNT_ID
  if (!a) throw new Error('META_AD_ACCOUNT_ID não configurado')
  return a
}

async function metaGet(path: string, params: Record<string, string> = {}, revalidate = 300) {
  const url = new URL(`${BASE}/${path}`)
  url.searchParams.set('access_token', tok())
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), { next: { revalidate } })
  const json = await res.json()
  if (json.error) throw new Error(`Meta API: ${json.error.message} [code ${json.error.code}]`)
  return json
}

export async function metaPost(path: string, body: Record<string, string>) {
  const url = new URL(`${BASE}/${path}`)
  const form = new URLSearchParams()
  form.set('access_token', tok())
  Object.entries(body).forEach(([k, v]) => form.set(k, v))

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  })
  const json = await res.json()
  if (json.error) throw new Error(`Meta API: ${json.error.message}`)
  return json
}

function action(actions: any[] | undefined, types: string[]): number {
  if (!actions) return 0
  return types.reduce((s, t) => {
    const found = actions.find((a) => a.action_type === t)
    return s + (found ? parseInt(found.value) : 0)
  }, 0)
}

function cents(v: string | number | undefined): number {
  if (!v) return 0
  return parseFloat(String(v)) / 100
}

function parseInsight(i: any) {
  const actions = i?.actions ?? []
  return {
    spend: parseFloat(i?.spend ?? '0'),
    impressions: parseInt(i?.impressions ?? '0'),
    clicks: parseInt(i?.clicks ?? '0'),
    reach: parseInt(i?.reach ?? '0'),
    cpm: parseFloat(i?.cpm ?? '0'),
    purchases_meta: action(actions, ['purchase', 'offsite_conversion.fb_pixel_purchase']),
    landing_page_views: action(actions, ['landing_page_view']),
    checkout_initiated: action(actions, ['initiate_checkout']),
  }
}

// ─── Account-level insights (KPI + Funnel) ───────────────────────────────────

export async function getAccountInsights() {
  const data = await metaGet(`${acc()}/insights`, {
    fields: 'spend,impressions,clicks,reach,cpm,actions',
    date_preset: 'last_30d',
    level: 'account',
  })
  return parseInsight(data.data?.[0])
}

// ─── Full campaign hierarchy ──────────────────────────────────────────────────

export async function getCampaignsHierarchy() {
  const account = acc()

  const [campaigns, campInsights, adsets, adsetInsights, ads, adInsights] =
    await Promise.all([
      metaGet(`${account}/campaigns`, {
        fields: 'id,name,status,daily_budget,lifetime_budget',
        limit: '100',
      }),
      metaGet(`${account}/insights`, {
        fields: 'campaign_id,spend,impressions,clicks,reach,cpm,actions',
        level: 'campaign',
        date_preset: 'last_30d',
        limit: '100',
      }),
      metaGet(`${account}/adsets`, {
        fields: 'id,name,status,daily_budget,lifetime_budget,campaign_id',
        limit: '100',
      }),
      metaGet(`${account}/insights`, {
        fields: 'adset_id,spend,impressions,clicks,reach,cpm,actions',
        level: 'adset',
        date_preset: 'last_30d',
        limit: '100',
      }),
      metaGet(`${account}/ads`, {
        fields: 'id,name,status,adset_id,creative{instagram_permalink_url}',
        limit: '200',
      }),
      metaGet(`${account}/insights`, {
        fields: 'ad_id,spend,impressions,clicks,reach,cpm,actions',
        level: 'ad',
        date_preset: 'last_30d',
        limit: '200',
      }),
    ])

  // Build lookup maps
  const campInsMap: Record<string, any> = {}
  for (const i of campInsights.data ?? []) campInsMap[i.campaign_id] = i

  const adsetInsMap: Record<string, any> = {}
  for (const i of adsetInsights.data ?? []) adsetInsMap[i.adset_id] = i

  const adInsMap: Record<string, any> = {}
  for (const i of adInsights.data ?? []) adInsMap[i.ad_id] = i

  const adsetsByCamp: Record<string, any[]> = {}
  for (const a of adsets.data ?? []) {
    if (!adsetsByCamp[a.campaign_id]) adsetsByCamp[a.campaign_id] = []
    adsetsByCamp[a.campaign_id].push(a)
  }

  const adsByAdset: Record<string, any[]> = {}
  for (const a of ads.data ?? []) {
    if (!adsByAdset[a.adset_id]) adsByAdset[a.adset_id] = []
    adsByAdset[a.adset_id].push(a)
  }

  return (campaigns.data ?? []).map((c: any) => {
    const ci = parseInsight(campInsMap[c.id])
    const campBudget = cents(c.daily_budget) || cents(c.lifetime_budget)
    const isCBO = campBudget > 0

    const campaignAdsets = (adsetsByCamp[c.id] ?? []).map((as: any) => {
      const ai = parseInsight(adsetInsMap[as.id])
      const adsetBudget = cents(as.daily_budget) || cents(as.lifetime_budget)

      const adsetAds = (adsByAdset[as.id] ?? []).map((ad: any) => {
        const adi = parseInsight(adInsMap[ad.id])
        return {
          id: ad.id,
          name: ad.name,
          status: ad.status as 'ACTIVE' | 'PAUSED',
          instagram_url: ad.creative?.instagram_permalink_url ?? '',
          ...adi,
        }
      })

      return {
        id: as.id,
        name: as.name,
        status: as.status as 'ACTIVE' | 'PAUSED',
        budget: adsetBudget,
        budget_type: 'ABO' as const,
        ...ai,
        ads: adsetAds,
      }
    })

    return {
      id: c.id,
      name: c.name,
      status: c.status as 'ACTIVE' | 'PAUSED',
      budget: campBudget,
      budget_type: (isCBO ? 'CBO' : 'ABO') as 'CBO' | 'ABO',
      ...ci,
      adsets: campaignAdsets,
    }
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function updateEntityStatus(id: string, status: 'ACTIVE' | 'PAUSED') {
  return metaPost(id, { status })
}

export async function updateEntityBudget(id: string, dailyBudgetBRL: number) {
  return metaPost(id, { daily_budget: String(Math.round(dailyBudgetBRL * 100)) })
}

export function isMetaConfigured() {
  return !!(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID)
}
