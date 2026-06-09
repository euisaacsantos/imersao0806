'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { CampaignData, AdSetData, AdData, CampaignStatus } from '@/lib/mock-data'
import {
  ChevronDown,
  ChevronRight,
  Pause,
  Play,
  ExternalLink,
  Pencil,
  Check,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'

// ─── Formatters ───────────────────────────────────────────────────────────────
function brl(v: number) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function int(v: number) { return v.toLocaleString('pt-BR') }
function pct(v: number) { return v.toFixed(2) + 'x' }

// ─── Columns ──────────────────────────────────────────────────────────────────
const COLS = [
  { key: 'name',        label: 'Nome',       width: 'minmax(200px, 1fr)', align: 'left'   },
  { key: 'budget',      label: 'Orçamento',  width: '110px',              align: 'right'  },
  { key: 'spend',       label: 'Investido',  width: '110px',              align: 'right'  },
  { key: 'cpm',         label: 'CPM',        width: '80px',               align: 'right'  },
  { key: 'impressions', label: 'Impressões', width: '100px',              align: 'right'  },
  { key: 'clicks',      label: 'Cliques',    width: '80px',               align: 'right'  },
  { key: 'reach',       label: 'Alcance',    width: '90px',               align: 'right'  },
  { key: 'sales',       label: 'Vendas',     width: '70px',               align: 'right'  },
  { key: 'profit',      label: 'Lucro',      width: '110px',              align: 'right'  },
  { key: 'roas',        label: 'ROAS',       width: '70px',               align: 'right'  },
  { key: 'actions',     label: '',           width: '90px',               align: 'center' },
] as const

const gridTemplate = COLS.map((c) => c.width).join(' ')

// ─── API call helper ──────────────────────────────────────────────────────────
async function callUpdate(id: string, action: string, value: unknown) {
  const res = await fetch('/api/meta/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, action, value }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Erro ao atualizar')
  return json
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoasCell({ value }: { value: number }) {
  const color = value >= 3 ? '#22c55e' : value >= 2 ? '#ff8c42' : '#ef4444'
  return <span className="font-bold text-sm" style={{ color }}>{pct(value)}</span>
}

function StatusToggle({ status, onToggle, loading }: {
  status: CampaignStatus
  onToggle: () => void
  loading?: boolean
}) {
  const active = status === 'ACTIVE'
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      disabled={loading}
      title={active ? 'Pausar' : 'Ativar'}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
        loading ? 'opacity-40 cursor-wait' :
        active
          ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e] hover:bg-[#ef4444]/10 hover:border-[#ef4444]/30 hover:text-[#ef4444]'
          : 'bg-[#555]/10 border-[#555]/30 text-[#888] hover:bg-[#22c55e]/10 hover:border-[#22c55e]/30 hover:text-[#22c55e]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#22c55e] pulse-active' : 'bg-[#555]'}`} />
      {active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
    </button>
  )
}

function BudgetCell({ value, editable, budgetType, onSave }: {
  value: number
  editable: boolean
  budgetType: string
  onSave: (v: number) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit(e: React.MouseEvent) {
    if (!editable) return
    e.stopPropagation()
    setDraft(String(value))
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  async function commit() {
    const num = parseFloat(draft.replace(',', '.'))
    if (!isNaN(num) && num > 0) {
      setSaving(true)
      try { await onSave(num) } finally { setSaving(false) }
    }
    setEditing(false)
  }

  function cancel() { setDraft(String(value)); setEditing(false) }

  if (!editable) return (
    <span className="text-[#555] text-xs italic">—</span>
  )

  if (editing) return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <span className="text-[#888] text-xs">R$</span>
      <input
        ref={inputRef}
        className="w-20 bg-[#0a0a0a] border border-[#ff6500] rounded px-1.5 py-0.5 text-sm text-white focus:outline-none text-right"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel() }}
      />
      {saving ? (
        <RefreshCw className="w-3.5 h-3.5 text-[#888] animate-spin" />
      ) : (
        <>
          <button onClick={commit} className="text-[#22c55e] hover:opacity-70"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={cancel} className="text-[#ef4444] hover:opacity-70"><X className="w-3.5 h-3.5" /></button>
        </>
      )}
    </div>
  )

  return (
    <button onClick={startEdit} className="group flex items-center gap-1 text-white hover:text-[#ff6500] transition-colors" title="Clique para editar">
      <span className="text-sm font-medium">R$ {int(value)}</span>
      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
    </button>
  )
}

// ─── Ad Row ───────────────────────────────────────────────────────────────────
function AdRow({ ad, onToggle, loadingId }: {
  ad: AdData & { roas: number; profit: number; sales: number }
  onToggle: (id: string) => void
  loadingId: string | null
}) {
  return (
    <div className="grid items-center py-2.5 px-4 table-row-hover border-b border-[#1e1e1e] text-sm" style={{ gridTemplateColumns: gridTemplate }}>
      <div className="flex items-center gap-2 pl-12 overflow-hidden">
        <span className="w-1 h-1 rounded-full bg-[#444] flex-shrink-0" />
        <span className="text-[#aaa] text-xs leading-snug break-all" title={ad.name}>{ad.name}</span>
      </div>
      <div className="text-right text-[#555] text-xs">—</div>
      <div className="text-right text-[#ccc] text-xs">{brl(ad.spend)}</div>
      <div className="text-right text-[#aaa] text-xs">R$ {ad.cpm.toFixed(2)}</div>
      <div className="text-right text-[#aaa] text-xs">{int(ad.impressions)}</div>
      <div className="text-right text-[#aaa] text-xs">{int(ad.clicks)}</div>
      <div className="text-right text-[#aaa] text-xs">{int(ad.reach)}</div>
      <div className="text-right text-white text-xs font-semibold">{ad.sales}</div>
      <div className={`text-right text-xs font-medium ${ad.profit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{brl(ad.profit)}</div>
      <div className="text-right"><RoasCell value={ad.roas} /></div>
      <div className="flex items-center justify-center gap-1.5">
        <StatusToggle status={ad.status} onToggle={() => onToggle(ad.id)} loading={loadingId === ad.id} />
        {ad.instagram_url ? (
          <a href={ad.instagram_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded bg-[#1e1e1e] hover:bg-[#ff6500]/20 text-[#888] hover:text-[#ff6500] transition-all" title="Ver no Instagram">
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : null}
      </div>
    </div>
  )
}

// ─── AdSet Row ────────────────────────────────────────────────────────────────
function AdSetRow({ adset, isExpanded, onToggleExpand, onToggle, onBudgetSave, loadingId }: {
  adset: AdSetData & { roas: number; profit: number; sales: number }
  isExpanded: boolean
  onToggleExpand: () => void
  onToggle: (id: string) => void
  onBudgetSave: (id: string, v: number) => Promise<void>
  loadingId: string | null
}) {
  return (
    <>
      <div className="grid items-center py-3 px-4 cursor-pointer bg-[#141414] hover:bg-[#181818] border-b border-[#1e1e1e] transition-colors" style={{ gridTemplateColumns: gridTemplate }} onClick={onToggleExpand}>
        <div className="flex items-center gap-2 pl-6 overflow-hidden">
          <span className="flex-shrink-0 text-[#555]">{isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}</span>
          <span className="text-[#ddd] text-xs font-medium leading-snug break-all" title={adset.name}>{adset.name}</span>
        </div>
        <div className="text-right">
          <BudgetCell value={adset.budget} editable={true} budgetType="ABO" onSave={(v) => onBudgetSave(adset.id, v)} />
        </div>
        <div className="text-right font-medium">{brl(adset.spend)}</div>
        <div className="text-right text-[#bbb]">R$ {adset.cpm.toFixed(2)}</div>
        <div className="text-right text-[#bbb]">{int(adset.impressions)}</div>
        <div className="text-right text-[#bbb]">{int(adset.clicks)}</div>
        <div className="text-right text-[#bbb]">{int(adset.reach)}</div>
        <div className="text-right font-bold text-white">{adset.sales}</div>
        <div className={`text-right font-semibold ${adset.profit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{brl(adset.profit)}</div>
        <div className="text-right"><RoasCell value={adset.roas} /></div>
        <div className="flex items-center justify-center">
          <StatusToggle status={adset.status} onToggle={() => onToggle(adset.id)} loading={loadingId === adset.id} />
        </div>
      </div>
      {isExpanded && adset.ads.map((ad) => (
        <AdRow key={ad.id} ad={ad as any} onToggle={onToggle} loadingId={loadingId} />
      ))}
    </>
  )
}

// ─── Campaign Row ─────────────────────────────────────────────────────────────
function CampaignRow({ campaign, isExpanded, onToggleExpand, onToggle, onBudgetSave, expandedAdsets, onToggleAdset, loadingId }: {
  campaign: CampaignData & { roas: number; profit: number; sales: number }
  isExpanded: boolean
  onToggleExpand: () => void
  onToggle: (id: string) => void
  onBudgetSave: (id: string, v: number) => Promise<void>
  expandedAdsets: Set<string>
  onToggleAdset: (id: string) => void
  loadingId: string | null
}) {
  const isCBO = campaign.budget_type === 'CBO'
  return (
    <>
      <div className="grid items-center py-3.5 px-4 cursor-pointer bg-[#111] hover:bg-[#161616] border-b border-[#2a2a2a] transition-colors" style={{ gridTemplateColumns: gridTemplate }} onClick={onToggleExpand}>
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex-shrink-0 text-[#ff6500]">{isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</span>
          <div className="overflow-hidden">
            <span className="text-white text-sm font-semibold leading-snug break-all block">{campaign.name}</span>
            <span className="text-[10px] text-[#555] font-mono">{campaign.id}</span>
          </div>
        </div>
        <div className="text-right">
          <BudgetCell value={campaign.budget} editable={isCBO} budgetType={campaign.budget_type} onSave={(v) => onBudgetSave(campaign.id, v)} />
          <span className="block text-[10px] text-[#555] mt-0.5">{campaign.budget_type}</span>
        </div>
        <div className="text-right font-bold text-white">{brl(campaign.spend)}</div>
        <div className="text-right text-[#ccc]">R$ {campaign.cpm.toFixed(2)}</div>
        <div className="text-right text-[#ccc]">{int(campaign.impressions)}</div>
        <div className="text-right text-[#ccc]">{int(campaign.clicks)}</div>
        <div className="text-right text-[#ccc]">{int(campaign.reach)}</div>
        <div className="text-right font-bold text-[#ff8c42] text-base">{campaign.sales}</div>
        <div className={`text-right font-bold ${campaign.profit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{brl(campaign.profit)}</div>
        <div className="text-right"><RoasCell value={campaign.roas} /></div>
        <div className="flex items-center justify-center">
          <StatusToggle status={campaign.status} onToggle={() => onToggle(campaign.id)} loading={loadingId === campaign.id} />
        </div>
      </div>
      {isExpanded && campaign.adsets.map((adset) => (
        <AdSetRow key={adset.id} adset={adset as any}
          isExpanded={expandedAdsets.has(adset.id)}
          onToggleExpand={() => onToggleAdset(adset.id)}
          onToggle={onToggle}
          onBudgetSave={onBudgetSave}
          loadingId={loadingId}
        />
      ))}
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [source, setSource] = useState<string>('mock')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set())
  const [expandedAdsets, setExpandedAdsets] = useState<Set<string>>(new Set())
  const [localStatuses, setLocalStatuses] = useState<Record<string, CampaignStatus>>({})

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/meta/campaigns')
      const json = await res.json()
      setCampaigns(json.campaigns ?? [])
      setSource(json.source ?? 'mock')
      if (json.campaigns?.length) {
        setExpandedCampaigns(new Set([json.campaigns[0].id]))
      }
    } catch (e) {
      setError('Erro ao carregar campanhas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  function toggleCampaign(id: string) {
    setExpandedCampaigns((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAdset(id: string) {
    setExpandedAdsets((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function getStatus(id: string, original: CampaignStatus): CampaignStatus {
    return localStatuses[id] ?? original
  }

  async function toggleStatus(id: string) {
    const originalCamp = campaigns.find(c => c.id === id)
    const originalAdset = campaigns.flatMap(c => c.adsets).find(a => a.id === id)
    const originalAd = campaigns.flatMap(c => c.adsets).flatMap(a => a.ads).find(a => a.id === id)
    const original = (originalCamp ?? originalAdset ?? originalAd)?.status ?? 'ACTIVE'
    const current = getStatus(id, original)
    const next: CampaignStatus = current === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'

    setLocalStatuses(prev => ({ ...prev, [id]: next }))
    setLoadingId(id)
    try {
      await callUpdate(id, 'status', next)
    } catch (e) {
      setLocalStatuses(prev => ({ ...prev, [id]: current }))
      console.error('Erro ao atualizar status:', e)
    } finally {
      setLoadingId(null)
    }
  }

  async function saveBudget(id: string, value: number) {
    await callUpdate(id, 'budget', value)
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) return { ...c, budget: value }
      return {
        ...c,
        adsets: c.adsets.map(a => a.id === id ? { ...a, budget: value } : a),
      }
    }))
  }

  const totals = campaigns.reduce(
    (acc, c) => ({ spend: acc.spend + c.spend, sales: acc.sales + (c as any).sales, profit: acc.profit + (c as any).profit }),
    { spend: 0, sales: 0, profit: 0 }
  )

  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-widest text-[#ff6500] uppercase">Gerenciador de Campanhas</h3>
            {source === 'live' ? (
              <span className="flex items-center gap-1 text-[10px] text-[#22c55e]"><Wifi className="w-3 h-3" /> ao vivo</span>
            ) : source === 'mock_fallback' ? (
              <span className="flex items-center gap-1 text-[10px] text-[#ff8c42]"><WifiOff className="w-3 h-3" /> fallback</span>
            ) : (
              <span className="text-[10px] text-[#555]">mock</span>
            )}
          </div>
          <p className="text-xs text-[#555] mt-0.5">
            {campaigns.length} campanhas · {campaigns.flatMap(c => c.adsets).length} conjuntos · {campaigns.flatMap(c => c.adsets).flatMap(a => a.ads).length} anúncios
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!loading && (
            <div className="flex items-center gap-6 text-sm">
              <div className="text-right">
                <p className="text-[#555] text-xs">Total Invest.</p>
                <p className="font-bold text-white">{brl(totals.spend)}</p>
              </div>
              <div className="text-right">
                <p className="text-[#555] text-xs">Total Vendas</p>
                <p className="font-bold text-[#ff8c42]">{totals.sales}</p>
              </div>
              <div className="text-right">
                <p className="text-[#555] text-xs">Total Lucro</p>
                <p className={`font-bold ${totals.profit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{brl(totals.profit)}</p>
              </div>
            </div>
          )}
          <button onClick={fetchCampaigns} disabled={loading}
            className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-[#888] hover:text-[#ff6500] transition-all disabled:opacity-40"
            title="Atualizar">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 py-3 bg-[#ef4444]/10 border-b border-[#ef4444]/20 text-[#ef4444] text-sm">{error}</div>
      )}

      {/* Table header */}
      <div className="grid px-4 py-2.5 border-b border-[#2a2a2a] bg-[#0d0d0d] sticky top-0 z-10" style={{ gridTemplateColumns: gridTemplate }}>
        {COLS.map((col) => (
          <div key={col.key} className="text-[10px] font-bold text-[#555] uppercase tracking-wider" style={{ textAlign: col.align }}>
            {col.label}
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-[#555] gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#ff6500]" />
          <span className="text-sm">Carregando campanhas...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {campaigns.map((campaign) => (
            <CampaignRow
              key={campaign.id}
              campaign={campaign as any}
              isExpanded={expandedCampaigns.has(campaign.id)}
              onToggleExpand={() => toggleCampaign(campaign.id)}
              onToggle={toggleStatus}
              onBudgetSave={saveBudget}
              expandedAdsets={expandedAdsets}
              onToggleAdset={toggleAdset}
              loadingId={loadingId}
            />
          ))}
        </div>
      )}

      <div className="px-4 py-3 border-t border-[#2a2a2a] text-xs text-[#444]">
        Clique na campanha ou conjunto para expandir · Clique no orçamento para editar · Toggle para pausar/ativar
      </div>
    </div>
  )
}
