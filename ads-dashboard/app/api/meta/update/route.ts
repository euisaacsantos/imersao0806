import { NextRequest, NextResponse } from 'next/server'
import { updateEntityStatus, updateEntityBudget, isMetaConfigured } from '@/lib/meta'

export async function POST(req: NextRequest) {
  if (!isMetaConfigured()) {
    // Mock mode: simulate success
    return NextResponse.json({ success: true, mock: true })
  }

  try {
    const { id, action, value } = await req.json()

    if (!id || !action) {
      return NextResponse.json({ error: 'Campos obrigatórios: id, action' }, { status: 400 })
    }

    if (action === 'status') {
      if (value !== 'ACTIVE' && value !== 'PAUSED') {
        return NextResponse.json({ error: 'value deve ser ACTIVE ou PAUSED' }, { status: 400 })
      }
      await updateEntityStatus(id, value)
      return NextResponse.json({ success: true, id, status: value })
    }

    if (action === 'budget') {
      if (typeof value !== 'number' || value <= 0) {
        return NextResponse.json({ error: 'value deve ser um número positivo' }, { status: 400 })
      }
      await updateEntityBudget(id, value)
      return NextResponse.json({ success: true, id, daily_budget: value })
    }

    return NextResponse.json({ error: `action desconhecida: ${action}` }, { status: 400 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/meta/update]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
