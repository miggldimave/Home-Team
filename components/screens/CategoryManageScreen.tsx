'use client'
import { useState, useTransition } from 'react'
import { Icons } from '@/components/shared/Icons'
import { CATEGORY_COLOR_OPTIONS } from '@/lib/tokens'
import { updateCategory, deleteCategory } from '@/app/tasks/new/actions'
import type { Category } from '@/lib/types'

interface CategoryManageScreenProps {
  categories: Category[]
  onBack: () => void
  onCategoryUpdated: (cat: Category) => void
  onCategoryDeleted: (catId: string) => void
}

export function CategoryManageScreen({ categories, onBack, onCategoryUpdated, onCategoryDeleted }: CategoryManageScreenProps) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColorIdx, setEditColorIdx] = useState(0)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const txt = '#2A221E'
  const muted = 'rgba(42,34,30,0.55)'
  const cardBg = 'rgba(255,255,255,0.78)'
  const cardBorder = '1px solid rgba(0,0,0,0.04)'
  const bg = 'rgb(253,248,241)'

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    const idx = CATEGORY_COLOR_OPTIONS.findIndex((c) => c.hue === cat.hue)
    setEditColorIdx(idx >= 0 ? idx : 0)
    setConfirmDeleteId(null)
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setError('')
  }

  const handleSave = (cat: Category) => {
    if (!editName.trim()) { setError('Bitte einen Namen eingeben.'); return }
    const col = CATEGORY_COLOR_OPTIONS[editColorIdx]
    const fd = new FormData()
    fd.append('name', editName.trim())
    fd.append('hue', col.hue)
    fd.append('soft', col.soft)
    fd.append('deep', col.deep)
    startTransition(async () => {
      const res = await updateCategory(cat.id, fd)
      if (res?.error) { setError(res.error); return }
      if (res?.category) onCategoryUpdated(res.category as Category)
      setEditingId(null)
    })
  }

  const handleDelete = (catId: string) => {
    startTransition(async () => {
      const res = await deleteCategory(catId)
      if (res?.error) { setError(res.error); return }
      onCategoryDeleted(catId)
      setConfirmDeleteId(null)
    })
  }

  return (
    <div style={{ minHeight: '100%', background: bg, padding: '0 0 60px' }}>
      <div style={{ padding: '60px 24px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {Icons.back(18, txt)}
        </button>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 34, color: txt, letterSpacing: -0.4, lineHeight: 1.05 }}>
          Kategorien
        </div>
      </div>

      <div style={{ margin: '24px 16px 0', borderRadius: 24, background: cardBg, border: cardBorder, overflow: 'hidden' }}>
        {categories.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: muted, fontSize: 14, fontStyle: 'italic' }}>
            Keine Kategorien vorhanden.
          </div>
        )}
        {categories.map((cat, i) => (
          <div key={cat.id} style={{ borderTop: i > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.hue, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: txt }}>{cat.name}</div>
              <button
                onClick={() => editingId === cat.id ? cancelEdit() : startEdit(cat)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
              >
                {Icons.pencil(16, editingId === cat.id ? txt : muted)}
              </button>
              <button
                onClick={() => setConfirmDeleteId(confirmDeleteId === cat.id ? null : cat.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
              >
                {Icons.trash(16, 'rgb(190,60,60)')}
              </button>
            </div>

            {editingId === cat.id && (
              <div style={{ padding: '0 16px 16px' }}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)', fontSize: 15, color: txt, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
                />
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {CATEGORY_COLOR_OPTIONS.map((col, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEditColorIdx(idx)}
                      style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer', background: col.hue, flexShrink: 0, boxShadow: editColorIdx === idx ? `0 0 0 3px ${bg}, 0 0 0 5px ${col.hue}` : 'none', transition: 'box-shadow 0.15s' }}
                    />
                  ))}
                </div>
                {error && <div style={{ marginBottom: 10, fontSize: 12, color: 'rgb(160,50,50)' }}>{error}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={cancelEdit} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', background: 'transparent', color: muted, fontSize: 13, fontWeight: 500 }}>
                    Abbrechen
                  </button>
                  <button onClick={() => handleSave(cat)} disabled={isPending} style={{ flex: 2, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', background: txt, color: '#FDF8F1', fontSize: 13, fontWeight: 600 }}>
                    {isPending ? 'Speichern…' : 'Speichern'}
                  </button>
                </div>
              </div>
            )}

            {confirmDeleteId === cat.id && (
              <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
                <button onClick={() => setConfirmDeleteId(null)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', background: 'transparent', color: muted, fontSize: 13, fontWeight: 500 }}>
                  Abbrechen
                </button>
                <button onClick={() => handleDelete(cat.id)} disabled={isPending} style={{ flex: 2, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'rgb(190,60,60)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                  {isPending ? 'Löschen…' : `„${cat.name}" löschen`}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
