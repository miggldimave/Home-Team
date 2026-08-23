import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

// Supabase pausiert Free-Projekte nach 7 Tagen ohne Aktivität. Ein täglicher
// Treffer auf Postgres setzt diesen Zähler zurück.
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const startedAt = Date.now()

  // Echte Query gegen eine Tabelle — nur so wird Postgres angefasst und nicht
  // bloß der PostgREST-Cache.
  const { error } = await admin.from('households').select('id').limit(1)

  const durationMs = Date.now() - startedAt

  if (error) {
    console.error('[keepalive] Supabase nicht erreichbar:', error.message)
    return NextResponse.json(
      { ok: false, error: error.message, durationMs },
      { status: 503 }
    )
  }

  return NextResponse.json({ ok: true, durationMs })
}
