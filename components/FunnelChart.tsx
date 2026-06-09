'use client'

import { FunnelStep } from '@/lib/mock-data'
import { useEffect, useRef, useState } from 'react'

interface FunnelChartProps {
  steps: FunnelStep[]
}

function fmtNum(n: number) {
  return n.toLocaleString('pt-BR')
}

function fmtBRL(n: number) {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
}

function buildFunnelPath(
  steps: FunnelStep[],
  W: number,
  H: number,
  pad: number
): string {
  const n = steps.length
  const maxVal = steps[0].value
  const xs = steps.map((_, i) => (i / (n - 1)) * W)
  const halfH = steps.map((s) => (s.value / maxVal) * (H / 2 - pad))

  const topYs = halfH.map((h) => H / 2 - h)
  const botYs = halfH.map((h) => H / 2 + h)

  let d = `M ${xs[0]},${topYs[0]}`
  for (let i = 1; i < n; i++) {
    const mx = (xs[i - 1] + xs[i]) / 2
    d += ` C ${mx},${topYs[i - 1]} ${mx},${topYs[i]} ${xs[i]},${topYs[i]}`
  }
  d += ` L ${xs[n - 1]},${botYs[n - 1]}`
  for (let i = n - 2; i >= 0; i--) {
    const mx = (xs[i] + xs[i + 1]) / 2
    d += ` C ${mx},${botYs[i + 1]} ${mx},${botYs[i]} ${xs[i]},${botYs[i]}`
  }
  d += ' Z'
  return d
}

export default function FunnelChart({ steps }: FunnelChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(900)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      setWidth(el.clientWidth)
    })
    obs.observe(el)
    setWidth(el.clientWidth)
    return () => obs.disconnect()
  }, [])

  const H = 200
  const PAD = 12
  const path = buildFunnelPath(steps, width, H, PAD)
  const n = steps.length

  const maxVal = steps[0].value
  const xs = steps.map((_, i) => (i / (n - 1)) * width)

  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1 text-xs font-bold tracking-widest text-[#ff6500] uppercase">
        <span>Funil Completo</span>
        {steps.slice(0, -1).map((s, i) => (
          <span key={i}>
            <span className="text-[#444] mx-1">·</span>
            {s.name}
            <span className="text-[#888] ml-1">→</span>
          </span>
        ))}
        <span>{steps[steps.length - 1].name}</span>
      </div>

      {/* Step stats */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-[10px] text-[#666] uppercase tracking-wide truncate">
              {s.name}
            </span>
            <span className="text-lg font-bold metric-value text-white">
              {fmtNum(s.value)}
            </span>
            {s.revenue !== undefined && (
              <span className="text-xs text-[#22c55e] font-medium">
                {fmtBRL(s.revenue)}
              </span>
            )}
            {s.conversionRate !== undefined && (
              <span
                className={`text-xs font-medium ${
                  s.conversionRate >= 50
                    ? 'text-[#22c55e]'
                    : s.conversionRate >= 20
                    ? 'text-[#ff8c42]'
                    : 'text-[#ef4444]'
                }`}
              >
                → {s.conversionRate}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* SVG Funnel */}
      <div ref={containerRef} className="w-full">
        <svg
          width={width}
          height={H}
          viewBox={`0 0 ${width} ${H}`}
          className="w-full"
          style={{ height: H }}
        >
          <defs>
            <linearGradient id="funnelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6500" stopOpacity="1" />
              <stop offset="100%" stopColor="#ff8c42" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Vertical dividers at each step */}
          {xs.slice(1, -1).map((x, i) => (
            <line
              key={i}
              x1={x}
              y1={0}
              x2={x}
              y2={H}
              stroke="#ffffff"
              strokeWidth={1}
              strokeOpacity={0.08}
              strokeDasharray="4 4"
            />
          ))}

          <path d={path} fill="url(#funnelGrad)" />
        </svg>
      </div>
    </div>
  )
}
