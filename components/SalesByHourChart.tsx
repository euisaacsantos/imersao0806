'use client'

import { SalesByHour } from '@/lib/mock-data'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface SalesByHourChartProps {
  data: SalesByHour[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl text-sm">
      <p className="text-[#888] mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-[#aaa]">{p.name}:</span>
          <span className="font-semibold">
            {p.dataKey === 'revenue'
              ? 'R$ ' + p.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
              : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

export default function SalesByHourChart({ data }: SalesByHourChartProps) {
  const peakHour = data.reduce(
    (best, d) => (d.sales > best.sales ? d : best),
    data[0]
  )

  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold tracking-widest text-[#ff6500] uppercase">
            Vendas por Horário
          </h3>
          <p className="text-xs text-[#555] mt-0.5">
            Pico: {peakHour.hour} — {peakHour.sales} vendas
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-[#888]">
            <span className="w-3 h-3 rounded-sm bg-[#ff6500] inline-block" />
            Vendas
          </span>
          <span className="flex items-center gap-1.5 text-[#888]">
            <span className="w-3 h-1 bg-[#22c55e] inline-block rounded" />
            Receita
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#555', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={1}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#555', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#555', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v) => 'R$' + (v / 1000).toFixed(0) + 'k'}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e1e1e' }} />
          <Bar
            yAxisId="left"
            dataKey="sales"
            name="Vendas"
            fill="#ff6500"
            radius={[3, 3, 0, 0]}
            maxBarSize={24}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            name="Receita"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#22c55e' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
