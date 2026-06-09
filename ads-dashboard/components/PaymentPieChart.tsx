'use client'

import { PaymentMethod } from '@/lib/mock-data'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface PaymentPieChartProps {
  data: PaymentMethod[]
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as PaymentMethod
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl text-sm">
      <p className="font-semibold text-white">{d.name}</p>
      <p className="text-[#888] mt-1">
        <span className="text-white font-medium">{d.value}%</span> dos pagamentos
      </p>
      <p className="text-[#888]">
        <span className="text-white font-medium">{d.count}</span> vendas
      </p>
    </div>
  )
}

const RADIAN = Math.PI / 180
function renderLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
}: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight="bold"
    >
      {value}%
    </text>
  )
}

export default function PaymentPieChart({ data }: PaymentPieChartProps) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 flex flex-col h-full">
      <h3 className="text-sm font-bold tracking-widest text-[#ff6500] uppercase mb-1">
        Método de Pagamento
      </h3>
      <p className="text-xs text-[#555] mb-4">
        {total} vendas no período
      </p>

      <div className="flex-1 flex items-center justify-center min-h-[200px]">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              dataKey="value"
              labelLine={false}
              label={renderLabel}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2 mt-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: d.color }}
              />
              <span className="text-sm text-[#aaa]">{d.name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#666]">{d.count} vendas</span>
              <span className="font-semibold text-white w-10 text-right">
                {d.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
