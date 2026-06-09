import { NextResponse } from 'next/server'
import { getCampaignsHierarchy, isMetaConfigured } from '@/lib/meta'
import { getSalesByEntity, isSupabaseConfigured } from '@/lib/supabase-server'
import { mockCampaigns } from '@/lib/mock-data'

export const revalidate = 0

export async function GET() {
  if (!isMetaConfigured()) {
    return NextResponse.json({ campaigns: mockCampaigns, source: 'mock' })
  }

  try {
    const [metaCampaigns, salesByEntity] = await Promise.all([
      getCampaignsHierarchy(),
      isSupabaseConfigured() ? getSalesByEntity() : null,
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campaigns = (metaCampaigns as any[]).map((camp) => {
      const campSales = salesByEntity?.byCampaign[camp.id] ?? { count: 0, revenue: 0 }
      const campProfit = campSales.revenue - camp.spend
      const campRoas = camp.spend > 0 ? campSales.revenue / camp.spend : 0

      return {
        ...camp,
        sales: campSales.count,
        profit: campProfit,
        roas: campRoas,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        adsets: camp.adsets.map((adset: any) => {
          const adsetSales = salesByEntity?.byAdset[adset.id] ?? { count: 0, revenue: 0 }
          const adsetProfit = adsetSales.revenue - adset.spend
          const adsetRoas = adset.spend > 0 ? adsetSales.revenue / adset.spend : 0

          return {
            ...adset,
            sales: adsetSales.count,
            profit: adsetProfit,
            roas: adsetRoas,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ads: adset.ads.map((ad: any) => {
              const adSales = salesByEntity?.byAd[ad.id] ?? { count: 0, revenue: 0 }
              const adProfit = adSales.revenue - ad.spend
              const adRoas = ad.spend > 0 ? adSales.revenue / ad.spend : 0

              return {
                ...ad,
                sales: adSales.count,
                profit: adProfit,
                roas: adRoas,
              }
            }),
          }
        }),
      }
    })

    return NextResponse.json({ campaigns, source: 'live' })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/meta/campaigns]', msg)
    return NextResponse.json(
      { error: msg, campaigns: mockCampaigns, source: 'mock_fallback' },
      { status: 200 } // 200 + fallback so the UI still renders
    )
  }
}
