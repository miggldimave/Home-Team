// 1:1 port of components/screens/CategoryManageScreen.tsx (web).
// Web mutates categories via server actions (updateCategory/deleteCategory in
// app/tasks/new/actions.ts); mobile calls supabase directly on `categories`
// under RLS (insert/update/delete policies exist).
import { useState } from 'react'
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet } from 'react-native'
import { Icons } from '@/components/shared/Icons'
import { supabase } from '@/lib/supabase'
import { CATEGORY_COLOR_OPTIONS } from '@/lib/tokens'
import { serifFont } from '@/lib/fonts'
import type { Category } from '@/lib/types'

interface CategoryManageScreenProps {
  categories: Category[]
  onBack: () => void
  onCategoryUpdated: (cat: Category) => void
  onCategoryDeleted: (catId: string) => void
}

export function CategoryManageScreen({ categories, onBack, onCategoryUpdated, onCategoryDeleted }: CategoryManageScreenProps) {
  const [isPending, setIsPending] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColorIdx, setEditColorIdx] = useState(0)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const txt = '#2A221E'
  const muted = 'rgba(42,34,30,0.55)'
  const cardBg = 'rgba(255,255,255,0.78)'
  const cardBorder = 'rgba(0,0,0,0.04)'
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

  const handleSave = async (cat: Category) => {
    if (!editName.trim()) { setError('Bitte einen Namen eingeben.'); return }
    const col = CATEGORY_COLOR_OPTIONS[editColorIdx]
    setIsPending(true)
    const { data, error: err } = await supabase
      .from('categories')
      .update({ name: editName.trim(), hue: col.hue, soft: col.soft, deep: col.deep })
      .eq('id', cat.id)
      .select()
      .single()
    setIsPending(false)
    if (err) { setError(err.message); return }
    if (data) onCategoryUpdated(data as Category)
    setEditingId(null)
  }

  const handleDelete = async (catId: string) => {
    setIsPending(true)
    const { error: err } = await supabase.from('categories').delete().eq('id', catId)
    setIsPending(false)
    if (err) { setError(err.message); return }
    onCategoryDeleted(catId)
    setConfirmDeleteId(null)
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          {Icons.back(18, txt)}
        </Pressable>
        <Text style={{ fontFamily: serifFont, fontSize: 34, color: txt, letterSpacing: -0.4, lineHeight: 36 }}>
          Kategorien
        </Text>
      </View>

      <View style={[styles.list, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        {categories.length === 0 && (
          <Text style={{ padding: 24, textAlign: 'center', color: muted, fontSize: 14, fontStyle: 'italic' }}>
            Keine Kategorien vorhanden.
          </Text>
        )}
        {categories.map((cat, i) => (
          <View key={cat.id} style={i > 0 ? { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.04)' } : null}>
            <View style={styles.row}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: cat.hue, flexShrink: 0 }} />
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: txt }}>{cat.name}</Text>
              <Pressable onPress={() => editingId === cat.id ? cancelEdit() : startEdit(cat)} style={{ padding: 6 }}>
                {Icons.pencil(16, editingId === cat.id ? txt : muted)}
              </Pressable>
              <Pressable onPress={() => setConfirmDeleteId(confirmDeleteId === cat.id ? null : cat.id)} style={{ padding: 6 }}>
                {Icons.trash(16, 'rgb(190,60,60)')}
              </Pressable>
            </View>

            {editingId === cat.id && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                  style={styles.input}
                  placeholderTextColor="rgba(42,34,30,0.35)"
                />
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                  {CATEGORY_COLOR_OPTIONS.map((col, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => setEditColorIdx(idx)}
                      style={[
                        styles.colorDot,
                        { backgroundColor: col.hue },
                        editColorIdx === idx
                          ? { borderWidth: 3, borderColor: bg, shadowColor: col.hue, shadowOpacity: 1, shadowRadius: 0 }
                          : null,
                      ]}
                    />
                  ))}
                </View>
                {!!error && <Text style={{ marginBottom: 10, fontSize: 12, color: 'rgb(160,50,50)' }}>{error}</Text>}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable onPress={cancelEdit} style={styles.cancelBtn}>
                    <Text style={{ color: muted, fontSize: 13, fontWeight: '500' }}>Abbrechen</Text>
                  </Pressable>
                  <Pressable onPress={() => handleSave(cat)} disabled={isPending} style={styles.saveBtn}>
                    <Text style={{ color: '#FDF8F1', fontSize: 13, fontWeight: '600' }}>
                      {isPending ? 'Speichern…' : 'Speichern'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {confirmDeleteId === cat.id && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={() => setConfirmDeleteId(null)} style={styles.cancelBtn}>
                  <Text style={{ color: muted, fontSize: 13, fontWeight: '500' }}>Abbrechen</Text>
                </Pressable>
                <Pressable onPress={() => handleDelete(cat.id)} disabled={isPending} style={styles.deleteBtn}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                    {isPending ? 'Löschen…' : `„${cat.name}" löschen`}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  list: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(0,0,0,0.02)',
    fontSize: 15,
    color: '#2A221E',
    marginBottom: 12,
  },
  colorDot: {
    width: 30, height: 30, borderRadius: 15, flexShrink: 0,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2A221E',
    alignItems: 'center',
  },
  deleteBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgb(190,60,60)',
    alignItems: 'center',
  },
})
