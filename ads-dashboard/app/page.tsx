import KPICards from '@/components/KPICards'
import FunnelChart from '@/components/FunnelChart'
import SalesByHourChart from '@/components/SalesByHourChart'
import PaymentPieChart from '@/components/PaymentPieChart'
import CampaignManager from '@/components/CampaignManager'
import { getDashboardData } from '@/lib/data-server'

export const revalidate = 300 // revalida a cada 5 min

export default async function DashboardPage() {
  const { kpi, funnel, paymentMethods, salesByHour, source } =
    await getDashboardData()

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const sourceLabel =
    source === 'live'
      ? { text: 'Dados ao vivo', color: 'text-[#22c55e]', dot: 'bg-[#22c55e]' }
      : source === 'partial'
      ? { text: 'Dados parciais', color: 'text-[#ff8c42]', dot: 'bg-[#ff8c42]' }
      : { text: 'Dados mockados', color: 'text-[#888]', dot: 'bg-[#ff6500]' }

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-4 md:p-6 space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ff6500] flex items-center justify-center text-white font-black text-sm">
            AD
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">
              Ads Dashboard
            </h1>
            <p className="text-xs text-[#555] capitalize mt-0.5">{today}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#111] border border-[#2a2a2a] text-xs text-[#888]">
            Últimos 30 dias
          </span>
          <span
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111] border border-[#2a2a2a] text-xs ${sourceLabel.color}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${sourceLabel.dot} pulse-active`}
            />
            {sourceLabel.text}
          </span>
        </div>
      </header>

      {/* KPI Cards */}
      <KPICards data={kpi} />

      {/* Funnel + Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <FunnelChart steps={funnel} />
        <PaymentPieChart data={paymentMethods} />
      </div>

      {/* Sales by Hour */}
      <SalesByHourChart data={salesByHour} />

      {/* Campaign Manager — busca dados via API client-side */}
      <CampaignManager />

      {/* Footer */}
      <footer className="text-center text-xs text-[#333] pb-2">
        Webhook:{' '}
        <code className="text-[#555]">POST /api/webhook</code>
        {' · '}
        <a
          href="/api/webhook"
          target="_blank"
          className="text-[#ff6500]/60 hover:text-[#ff6500] transition-colors"
        >
          ver docs
        </a>
      </footer>
    </main>
  )
}
