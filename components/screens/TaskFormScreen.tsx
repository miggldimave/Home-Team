'use client'
import { useState, useTransition } from 'react'
import { Icons } from '@/components/shared/Icons'
import { AVAILABLE_ICONS, CATEGORY_COLOR_OPTIONS } from '@/lib/tokens'
import { createTask, updateTask, createCategory } from '@/app/tasks/new/actions'
import { CategoryManageScreen } from '@/components/screens/CategoryManageScreen'
import type { Category, ScoringMode, Task } from '@/lib/types'

interface TaskFormScreenProps {
  categories: Category[]
  scoringMode: ScoringMode
  editTask?: Task
  onBack: () => void
  onSaved: (task: Task) => void
}

export function TaskFormScreen({ categories: initialCategories, scoringMode, editTask, onBack, onSaved }: TaskFormScreenProps) {
  const [isPending, startTransition] = useTransition()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [name, setName] = useState(editTask?.name ?? '')
  const [selectedCat, setSelectedCat] = useState(editTask?.category ?? initialCategories[0]?.name ?? '')
  const [icon, setIcon] = useState(editTask?.icon ?? AVAILABLE_ICONS[0])
  const [pts, setPts] = useState(String(editTask?.pts ?? 5))
  const [timeMinutes, setTimeMinutes] = useState(String(editTask?.time_minutes ?? 15))
  const [cycleDays, setCycleDays] = useState(String(editTask?.cycle_days ?? 7))
  const [error, setError] = useState('')
  const [showCatManage, setShowCatManage] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColorIdx, setNewCatColorIdx] = useState(0)
  const [catError, setCatError] = useState('')

  const txt = '#2A221E'
  const muted = 'rgba(42,34,30,0.55)'
  const cardBg = 'rgba(255,255,255,0.78)'
  const cardBorder = '1px solid rgba(0,0,0,0.04)'
  const bg = 'rgb(253,248,241)'

  const selectedCatObj = categories.find((c) => c.name === selectedCat)

  const handleSubmit = () => {
    if (!name.trim()) { setError('Bitte einen Namen eingeben.'); return }
    if (!selectedCat) { setError('Bitte eine Kategorie wählen.'); return }
    const fd = new FormData()
    fd.append('name', name.trim())
    fd.append('category', selectedCat)
    fd.append('icon', icon)
    fd.append('pts', pts)
    fd.append('time_minutes', timeMinutes)
    fd.append('cycle_days', cycleDays)
    startTransition(async () => {
      const res = editTask ? await updateTask(editTask.id, fd) : await createTask(fd)
      if (res?.error) { setError(res.error); return }
      if (res?.task) onSaved(res.task)
    })
  }

  const handleCreateCategory = () => {
    if (!newCatName.trim()) { setCatError('Bitte einen Namen eingeben.'); return }
    const col = CATEGORY_COLOR_OPTIONS[newCatColorIdx]
    const fd = new FormData()
    fd.append('name', newCatName.trim())
    fd.append('hue', col.hue)
    fd.append('soft', col.soft)
    fd.append('deep', col.deep)
    startTransition(async () => {
      const res = await createCategory(fd)
      if (res?.error) { setCatError(res.error); return }
      if (res?.category) {
        setCategories((prev) => [...prev, res.category as Category].sort((a, b) => a.name.localeCompare(b.name)))
        setSelectedCat(res.category.name)
      }
      setShowCatModal(false)
      setNewCatName('')
      setCatError('')
    })
  }

  if (showCatManage) {
    return (
      <CategoryManageScreen
        categories={categories}
        onBack={() => setShowCatManage(false)}
        onCategoryUpdated={(updated) => {
          setCategories((prev) => prev.map((c) => c.id === updated.id ? updated : c))
          if (selectedCat === categories.find((c) => c.id === updated.id)?.name) setSelectedCat(updated.name)
        }}
        onCategoryDeleted={(id) => {
          setCategories((prev) => prev.filter((c) => c.id !== id))
          if (selectedCat === categories.find((c) => c.id === id)?.name) setSelectedCat(categories.find((c) => c.id !== id)?.name ?? '')
        }}
      />
    )
  }

  return (
    <div style={{ minHeight: '100%', background: bg, padding: '0 0 60px', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '60px 24px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {Icons.back(18, txt)}
        </button>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 34, color: txt, letterSpacing: -0.4, lineHeight: 1.05 }}>
          {editTask ? 'Aufgabe bearbeiten' : 'Aufgabe hinzufügen'}
        </div>
      </div>

      {/* Task name */}
      <div style={{ margin: '24px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <label style={{ display: 'block' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 8 }}>Name der Aufgabe</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Bad putzen"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt, outline: 'none', boxSizing: 'border-box' }}
          />
        </label>
      </div>

      {/* Category */}
      <div style={{ margin: '10px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: muted }}>Kategorie</div>
          <button onClick={() => setShowCatManage(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5, color: muted, fontSize: 12, fontWeight: 500 }}>
            {Icons.pencil(12, muted)} Bearbeiten
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setSelectedCat(c.name)} style={{ padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: selectedCat === c.name ? c.hue : 'rgba(0,0,0,0.04)', color: selectedCat === c.name ? '#fff' : muted, transition: 'all 0.15s' }}>
              {c.name}
            </button>
          ))}
          <button onClick={() => setShowCatModal(true)} style={{ padding: '8px 14px', borderRadius: 999, border: '1px dashed rgba(0,0,0,0.15)', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: muted, display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.plus(13, muted)} Neu
          </button>
        </div>
      </div>

      {/* Icon */}
      <div style={{ margin: '10px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 10 }}>Symbol</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {AVAILABLE_ICONS.map((ic) => (
            <button key={ic} onClick={() => setIcon(ic)} style={{ width: 48, height: 48, borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 22, background: icon === ic ? (selectedCatObj?.soft ?? 'rgba(0,0,0,0.06)') : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: icon === ic ? `0 0 0 2px ${selectedCatObj?.hue ?? txt}` : 'none', transition: 'all 0.15s' }}>
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      <div style={{ margin: '10px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 14 }}>Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>
            <div style={{ fontSize: 11, color: muted, marginBottom: 6 }}>Zeit (Min.)</div>
            <input type="number" min="1" value={timeMinutes} onChange={(e) => setTimeMinutes(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt, outline: 'none', boxSizing: 'border-box' }}/>
          </label>
          <label>
            <div style={{ fontSize: 11, color: muted, marginBottom: 6 }}>Alle X Tage</div>
            <input type="number" min="1" value={cycleDays} onChange={(e) => setCycleDays(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt, outline: 'none', boxSizing: 'border-box' }}/>
          </label>
          {scoringMode === 'punkte' && (
            <label style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 11, color: muted, marginBottom: 6 }}>Punkte</div>
              <input type="number" min="1" value={pts} onChange={(e) => setPts(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt, outline: 'none', boxSizing: 'border-box' }}/>
            </label>
          )}
        </div>
      </div>

      {error && (
        <div style={{ margin: '10px 16px 0', padding: '12px 16px', borderRadius: 14, background: 'rgba(200,60,60,0.08)', color: 'rgb(160,50,50)', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ margin: '16px 16px 0' }}>
        <button onClick={handleSubmit} disabled={isPending} style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', cursor: 'pointer', background: txt, color: '#FDF8F1', fontSize: 15, fontWeight: 600 }}>
          {isPending ? 'Speichern…' : editTask ? 'Änderungen speichern' : 'Aufgabe erstellen'}
        </button>
      </div>

      {/* New category modal */}
      {showCatModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: bg, borderRadius: '24px 24px 0 0', padding: '28px 20px 40px' }}>
            <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 26, color: txt, marginBottom: 20 }}>Neue Kategorie</div>
            <label style={{ display: 'block', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 6 }}>Name</div>
              <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="z.B. Garten" autoFocus style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt, outline: 'none', boxSizing: 'border-box' }}/>
            </label>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 8 }}>Farbe</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {CATEGORY_COLOR_OPTIONS.map((col, i) => (
                  <button key={i} onClick={() => setNewCatColorIdx(i)} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer', background: col.hue, boxShadow: newCatColorIdx === i ? `0 0 0 3px ${bg}, 0 0 0 5px ${col.hue}` : 'none', transition: 'box-shadow 0.15s' }}/>
                ))}
              </div>
            </div>
            {catError && <div style={{ marginBottom: 12, fontSize: 13, color: 'rgb(160,50,50)' }}>{catError}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowCatModal(false); setCatError('') }} style={{ flex: 1, padding: '13px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', background: 'transparent', color: muted, fontSize: 14, fontWeight: 500 }}>Abbrechen</button>
              <button onClick={handleCreateCategory} disabled={isPending} style={{ flex: 2, padding: '13px', borderRadius: 14, border: 'none', cursor: 'pointer', background: txt, color: '#FDF8F1', fontSize: 14, fontWeight: 600 }}>{isPending ? 'Erstellen…' : 'Erstellen'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
