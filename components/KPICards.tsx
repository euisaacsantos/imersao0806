'use client'

import { KPIData } from '@/lib/mock-data'
import { TrendingUp, DollarSign, ShoppingCart, Percent, BarChart2, Target } from 'lucide-react'

interface KPICardsProps {
  data: KPIData
}

function fmt(value: number, prefix = 'R$ ') {
  return (
    prefix +
    value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

function fmtInt(value: number) {
  return value.toLocaleString('pt-BR')
}

export default function KPICards({ data }: KPICardsProps) {
  const cards = [
    {
      label: 'Investimento',
      value: fmt(data.investment),
      sub: null,
      icon: DollarSign,
      color: 'text-[#ff6500]',
      bg: 'border-[#ff6500]/20',
    },
    {
      label: 'Custo por Venda',
      value: fmt(data.costPerSaleMeta),
      sub: (
        <div className="flex flex-col gap-0.5 mt-1">
          <span className="text-xs text-[#888]">
            Meta: <span className="text-white">{fmt(data.costPerSaleMeta)}</span>
          </span>
          <span className="text-xs text-[#888]">
            Banco: <span className="text-[#22c55e]">{fmt(data.costPerSaleDb)}</span>
          </span>
        </div>
      ),
      icon: Target,
      color: 'text-[#ff8c42]',
      bg: 'border-[#ff8c42]/20',
    },
    {
      label: 'Vendas',
      value: fmtInt(data.salesCount),
      sub: <span className="text-xs text-[#888] mt-1 block">via banco de dados</span>,
      icon: ShoppingCart,
      color: 'text-[#22c55e]',
      bg: 'border-[#22c55e]/20',
    },
    {
      label: 'Lucro',
      value: fmt(data.profit),
      sub: null,
      icon: TrendingUp,
      color: 'text-[#22c55e]',
      bg: 'border-[#22c55e]/20',
    },
    {
      label: 'ROAS',
      value: data.roas.toFixed(2) + 'x',
      sub: (
        <div className="mt-1">
          <div className="h-1 w-full bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ff6500] rounded-full"
              style={{ width: `${Math.min((data.roas / 5) * 100, 100)}%` }}
            />
          </div>
          <span className="text-xs text-[#888] mt-0.5 block">meta: 3.0x</span>
        </div>
      ),
      icon: BarChart2,
      color: data.roas >= 3 ? 'text-[#22c55e]' : 'text-[#ff6500]',
      bg: data.roas >= 3 ? 'border-[#22c55e]/20' : 'border-[#ff6500]/20',
    },
    {
      label: 'Margem',
      value:
        ((data.profit / (data.investment + data.profit)) * 100).toFixed(1) + '%',
      sub: (
        <span className="text-xs text-[#888] mt-1 block">
          Receita: {fmt(data.investment + data.profit)}
        </span>
      ),
      icon: Percent,
      color: 'text-[#a78bfa]',
      bg: 'border-[#a78bfa]/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`bg-[#111] border ${card.bg} rounded-xl p-4 flex flex-col`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#666] uppercase tracking-wider font-medium">
                {card.label}
              </span>
              <Icon className={`w-4 h-4 ${card.color} opacity-70`} />
            </div>
            <span className={`text-2xl font-bold metric-value ${card.color}`}>
              {card.value}
            </span>
            {card.sub}
          </div>
        )
      })}
    </div>
  )
}
