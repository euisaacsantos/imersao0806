import { getAccountInsights, isMetaConfigured } from './meta'
import {
  getSalesTotals,
  getSalesByPaymentMethod,
  getSalesByHour,
  isSupabaseConfigured,
} from './supabase-server'
import {
  mockKPIData,
  mockFunnelData,
  mockPaymentMethods,
  mockSalesByHour,
  type KPIData,
  type FunnelStep,
  type PaymentMethod,
  type SalesByHour,
} from './mock-data'

export interface DashboardData {
  kpi: KPIData
  funnel: FunnelStep[]
  paymentMethods: PaymentMethod[]
  salesByHour: SalesByHour[]
  source: 'live' | 'mock' | 'partial'
}

export async function getDashboardData(): Promise<DashboardData> {
  const hasMeta = isMetaConfigured()
  const hasSupabase = isSupabaseConfigured()

  if (!hasMeta && !hasSupabase) {
    return {
      kpi: mockKPIData,
      funnel: mockFunnelData,
      paymentMethods: mockPaymentMethods,
      salesByHour: mockSalesByHour,
      source: 'mock',
    }
  }

  const [metaResult, supabaseResult] = await Promise.allSettled([
    hasMeta ? getAccountInsights() : Promise.resolve(null),
    hasSupabase
      ? Promise.all([getSalesTotals(), getSalesByPaymentMethod(), getSalesByHour()])
      : Promise.resolve(null),
  ])

  const meta = metaResult.status === 'fulfilled' ? metaResult.value : null
  const supa = supabaseResult.status === 'fulfilled' ? supabaseResult.value : null

  if (metaResult.status === 'rejected') {
    console.error('[data-server] Meta error:', metaResult.reason)
  }
  if (supabaseResult.status === 'rejected') {
    console.error('[data-server] Supabase error:', supabaseResult.reason)
  }

  const [supaStats, supaPayments, supaHours] = supa ?? [null, null, null]

  // KPI
  const investment = meta?.spend ?? mockKPIData.investment
  const salesCount = supaStats?.count ?? mockKPIData.salesCount
  const totalRevenue = supaStats?.revenue ?? mockKPIData.investment + mockKPIData.profit
  const profit = totalRevenue - investment
  const roas = investment > 0 ? totalRevenue / investment : mockKPIData.roas
  const costPerSaleMeta =
    meta && meta.purchases_meta > 0
      ? meta.spend / meta.purchases_meta
      : mockKPIData.costPerSaleMeta
  const costPerSaleDb = investment > 0 && salesCount > 0
    ? investment / salesCount
    : mockKPIData.costPerSaleDb

  const kpi: KPIData = {
    investment,
    costPerSaleMeta,
    costPerSaleDb,
    salesCount,
    profit,
    roas,
  }

  // Funnel (Meta pixel events + Supabase sales)
  const funnel: FunnelStep[] = meta
    ? [
        { name: 'Cliques', value: meta.clicks || 1 },
        {
          name: 'LP Views',
          value: meta.landing_page_views || Math.round((meta.clicks || 1) * 0.93),
          conversionRate:
            meta.clicks > 0
              ? parseFloat(((meta.landing_page_views / meta.clicks) * 100).toFixed(1))
              : 93.4,
        },
        {
          name: 'Iniciar Compra',
          value: meta.checkout_initiated || Math.round((meta.landing_page_views || 1) * 0.24),
          conversionRate:
            meta.landing_page_views > 0
              ? parseFloat(((meta.checkout_initiated / meta.landing_page_views) * 100).toFixed(1))
              : 24.3,
        },
        {
          name: 'Vendas',
          value: salesCount,
          revenue: supaStats?.revenue,
          conversionRate:
            meta.checkout_initiated > 0
              ? parseFloat(((salesCount / meta.checkout_initiated) * 100).toFixed(1))
              : undefined,
        },
      ]
    : mockFunnelData

  return {
    kpi,
    funnel,
    paymentMethods: supaPayments ?? mockPaymentMethods,
    salesByHour: supaHours ?? mockSalesByHour,
    source: meta && supa ? 'live' : 'partial',
  }
}
