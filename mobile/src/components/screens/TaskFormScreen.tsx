import { useState } from 'react'
import { View, Text, Pressable, ScrollView, TextInput, Modal, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icons } from '@/components/shared/Icons'
import { AVAILABLE_ICONS, CATEGORY_COLOR_OPTIONS } from '@/lib/tokens'
import { supabase } from '@/lib/supabase'
import { CategoryManageScreen } from '@/components/screens/CategoryManageScreen'
import { serifFont } from '@/lib/fonts'
import type { Category, ScoringMode, Task } from '@/lib/types'

interface TaskFormScreenProps {
  categories: Category[]
  scoringMode: ScoringMode
  editTask?: Task
  onBack: () => void
  onSaved: (task: Task) => void
}

export function TaskFormScreen({ categories: initialCategories, scoringMode, editTask, onBack, onSaved }: TaskFormScreenProps) {
  const insets = useSafeAreaInsets()
  const [isPending, setIsPending] = useState(false)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [name, setName] = useState(editTask?.name ?? '')
  const [selectedCat, setSelectedCat] = useState(editTask?.category ?? initialCategories[0]?.name ?? '')
  const [icon, setIcon] = useState(editTask?.icon ?? AVAILABLE_ICONS[0])
  const [pts, setPts] = useState(String(editTask?.pts ?? 5))
  const [timeMinutes, setTimeMinutes] = useState(String(editTask?.time_minutes ?? 15))
  const initCycleDays = editTask?.cycle_days ?? 7
  const initUnit = initCycleDays % 30 === 0 ? 'months' : initCycleDays % 7 === 0 ? 'weeks' : 'days'
  const initValue = initUnit === 'months' ? initCycleDays / 30 : initUnit === 'weeks' ? initCycleDays / 7 : initCycleDays
  const [cycleValue, setCycleValue] = useState(String(initValue))
  const [cycleUnit, setCycleUnit] = useState<'days' | 'weeks' | 'months'>(initUnit)
  const [error, setError] = useState('')
  const [showCatManage, setShowCatManage] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColorIdx, setNewCatColorIdx] = useState(0)
  const [catError, setCatError] = useState('')

  const txt = '#2A221E'
  const muted = 'rgba(42,34,30,0.55)'
  const cardBg = 'rgba(255,255,255,0.78)'
  const cardBorderColor = 'rgba(0,0,0,0.04)'
  const bg = 'rgb(253,248,241)'

  const selectedCatObj = categories.find((c) => c.name === selectedCat)

  const getHouseholdId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const res = await supabase.from('profiles').select('household_id').eq('id', user.id).single()
    return (res.data?.household_id as string | undefined) ?? null
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Bitte einen Namen eingeben.'); return }
    if (!selectedCat) { setError('Bitte eine Kategorie wählen.'); return }
    setError('')
    const multiplier = cycleUnit === 'months' ? 30 : cycleUnit === 'weeks' ? 7 : 1
    const cycleDays = Math.max(1, Math.round(Number(cycleValue) * multiplier))

    setIsPending(true)
    try {
      const householdId = await getHouseholdId()
      if (!householdId) { setError('Kein Haushalt gefunden.'); return }

      const payload = {
        name: name.trim(),
        category: selectedCat,
        icon,
        pts: parseInt(pts, 10) || 5,
        time_minutes: parseInt(timeMinutes, 10) || 15,
        cycle_days: cycleDays,
      }

      if (editTask) {
        const { data, error: err } = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', editTask.id)
          .eq('household_id', householdId)
          .select()
          .single()
        if (err) { setError(err.message); return }
        if (data) onSaved(data as Task)
      } else {
        const { data, error: err } = await supabase
          .from('tasks')
          .insert({ ...payload, household_id: householdId })
          .select()
          .single()
        if (err) { setError(err.message); return }
        if (data) onSaved(data as Task)
      }
    } finally {
      setIsPending(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) { setCatError('Bitte einen Namen eingeben.'); return }
    const col = CATEGORY_COLOR_OPTIONS[newCatColorIdx]
    setCatError('')
    setIsPending(true)
    try {
      const householdId = await getHouseholdId()
      if (!householdId) { setCatError('Kein Haushalt gefunden.'); return }
      const { data, error: err } = await supabase
        .from('categories')
        .insert({
          household_id: householdId,
          name: newCatName.trim(),
          hue: col.hue,
          soft: col.soft,
          deep: col.deep,
        })
        .select()
        .single()
      if (err) { setCatError(err.message); return }
      if (data) {
        const newCategory = data as Category
        setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)))
        setSelectedCat(newCategory.name)
      }
      setShowCatModal(false)
      setNewCatName('')
      setCatError('')
    } finally {
      setIsPending(false)
    }
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
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingTop: 60, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable
            onPress={onBack}
            style={{ backgroundColor: 'rgba(255,255,255,0.75)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            {Icons.back(18, txt)}
          </Pressable>
          <Text style={{ fontFamily: serifFont, fontSize: 34, color: txt, letterSpacing: -0.4, lineHeight: 36 }}>
            {editTask ? 'Aufgabe bearbeiten' : 'Aufgabe hinzufügen'}
          </Text>
        </View>

        {/* Task name */}
        <View style={{ marginTop: 24, marginHorizontal: 16, padding: 20, borderRadius: 24, backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorderColor }}>
          <Text style={{ fontSize: 12, fontWeight: '500', color: muted, marginBottom: 8 }}>Name der Aufgabe</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="z.B. Bad putzen"
            placeholderTextColor="rgba(42,34,30,0.35)"
            style={{ width: '100%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt }}
          />
        </View>

        {/* Category */}
        <View style={{ marginTop: 10, marginHorizontal: 16, padding: 20, borderRadius: 24, backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorderColor }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: '500', color: muted }}>Kategorie</Text>
            <Pressable onPress={() => setShowCatManage(true)} style={{ paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              {Icons.pencil(12, muted)}
              <Text style={{ color: muted, fontSize: 12, fontWeight: '500' }}>Bearbeiten</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setSelectedCat(c.name)}
                style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: selectedCat === c.name ? c.hue : 'rgba(0,0,0,0.04)' }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: selectedCat === c.name ? '#fff' : muted }}>{c.name}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowCatModal(true)}
              style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.15)', flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              {Icons.plus(13, muted)}
              <Text style={{ fontSize: 13, fontWeight: '500', color: muted }}>Neu</Text>
            </Pressable>
          </View>
        </View>

        {/* Icon */}
        <View style={{ marginTop: 10, marginHorizontal: 16, padding: 20, borderRadius: 24, backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorderColor }}>
          <Text style={{ fontSize: 12, fontWeight: '500', color: muted, marginBottom: 10 }}>Symbol</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {AVAILABLE_ICONS.map((ic) => (
              <Pressable
                key={ic}
                onPress={() => setIcon(ic)}
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  backgroundColor: icon === ic ? (selectedCatObj?.soft ?? 'rgba(0,0,0,0.06)') : 'rgba(0,0,0,0.04)',
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: icon === ic ? 2 : 0,
                  borderColor: icon === ic ? (selectedCatObj?.hue ?? txt) : 'transparent',
                }}
              >
                <Text style={{ fontSize: 22 }}>{ic}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Details */}
        <View style={{ marginTop: 10, marginHorizontal: 16, padding: 20, borderRadius: 24, backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorderColor }}>
          <Text style={{ fontSize: 12, fontWeight: '500', color: muted, marginBottom: 14 }}>Details</Text>
          <View style={{ gap: 12 }}>
            {scoringMode === 'zeit' && (
              <View>
                <Text style={{ fontSize: 11, color: muted, marginBottom: 6 }}>Zeit (Min.)</Text>
                <TextInput
                  keyboardType="numeric"
                  value={timeMinutes}
                  onChangeText={setTimeMinutes}
                  style={{ width: '100%', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt }}
                />
              </View>
            )}
            <View>
              <Text style={{ fontSize: 11, color: muted, marginBottom: 6 }}>Wiederholung</Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TextInput
                  keyboardType="numeric"
                  value={cycleValue}
                  onChangeText={setCycleValue}
                  style={{ width: 64, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt, textAlign: 'center' }}
                />
                {(['days', 'weeks', 'months'] as const).map((u) => {
                  const labels = { days: 'Tage', weeks: 'Wochen', months: 'Monate' }
                  const active = cycleUnit === u
                  return (
                    <Pressable
                      key={u}
                      onPress={() => setCycleUnit(u)}
                      style={{
                        flex: 1, paddingVertical: 10, borderRadius: 12,
                        borderWidth: active ? 0 : 1, borderColor: 'rgba(0,0,0,0.08)',
                        backgroundColor: active ? txt : 'rgba(0,0,0,0.02)',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: active ? '#FDF8F1' : muted, fontSize: 13, fontWeight: active ? '600' : '400' }}>
                        {labels[u]}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
            {scoringMode === 'punkte' && (
              <View>
                <Text style={{ fontSize: 11, color: muted, marginBottom: 6 }}>Punkte</Text>
                <TextInput
                  keyboardType="numeric"
                  value={pts}
                  onChangeText={setPts}
                  style={{ width: '100%', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt }}
                />
              </View>
            )}
          </View>
        </View>

        {!!error && (
          <View style={{ marginTop: 10, marginHorizontal: 16, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, backgroundColor: 'rgba(200,60,60,0.08)' }}>
            <Text style={{ color: 'rgb(160,50,50)', fontSize: 13 }}>{error}</Text>
          </View>
        )}

        <View style={{ marginTop: 16, marginHorizontal: 16 }}>
          <Pressable
            onPress={handleSubmit}
            disabled={isPending}
            style={{ width: '100%', paddingVertical: 16, borderRadius: 18, backgroundColor: txt, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, opacity: isPending ? 0.7 : 1 }}
          >
            {isPending && <ActivityIndicator size="small" color="#FDF8F1" />}
            <Text style={{ color: '#FDF8F1', fontSize: 15, fontWeight: '600' }}>
              {isPending ? 'Speichern…' : editTask ? 'Änderungen speichern' : 'Aufgabe erstellen'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* New category modal */}
      <Modal visible={showCatModal} transparent animationType="fade" onRequestClose={() => { setShowCatModal(false); setCatError('') }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
          <View style={{ width: '100%', backgroundColor: bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingTop: 28, paddingBottom: 40 + insets.bottom }}>
            <Text style={{ fontFamily: serifFont, fontSize: 26, color: txt, marginBottom: 20 }}>Neue Kategorie</Text>
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: muted, marginBottom: 6 }}>Name</Text>
              <TextInput
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder="z.B. Garten"
                placeholderTextColor="rgba(42,34,30,0.35)"
                autoFocus
                style={{ width: '100%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt }}
              />
            </View>
            <View style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: muted, marginBottom: 8 }}>Farbe</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {CATEGORY_COLOR_OPTIONS.map((col, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setNewCatColorIdx(i)}
                    style={{
                      width: 34, height: 34, borderRadius: 17, backgroundColor: col.hue,
                      borderWidth: newCatColorIdx === i ? 3 : 0,
                      borderColor: bg,
                    }}
                  />
                ))}
              </View>
            </View>
            {!!catError && <Text style={{ marginBottom: 12, fontSize: 13, color: 'rgb(160,50,50)' }}>{catError}</Text>}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => { setShowCatModal(false); setCatError('') }}
                style={{ flex: 1, paddingVertical: 13, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', alignItems: 'center' }}
              >
                <Text style={{ color: muted, fontSize: 14, fontWeight: '500' }}>Abbrechen</Text>
              </Pressable>
              <Pressable
                onPress={handleCreateCategory}
                disabled={isPending}
                style={{ flex: 2, paddingVertical: 13, borderRadius: 14, backgroundColor: txt, alignItems: 'center', opacity: isPending ? 0.7 : 1 }}
              >
                <Text style={{ color: '#FDF8F1', fontSize: 14, fontWeight: '600' }}>{isPending ? 'Erstellen…' : 'Erstellen'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
