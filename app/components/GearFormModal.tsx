'use client';

// ============================================================
// GearFormModal — Modal para crear/editar gear (Client Component)
// Se comunica con server actions: createGear / updateGear
// ============================================================

import { useState, useEffect } from 'react'
import { createGear, updateGear, GearItem } from '@/app/actions/gear'

type Props = {
  item: GearItem | null   // null = crear, existente = editar
  onClose: () => void
}

const CATEGORIES = ['Weapon', 'Armor', 'Accessory']
const TIERS = ['base', 'PRI', 'DUO', 'TRI', 'PEN']
const SUBCATEGORIES: Record<string, string[]> = {
  Weapon: ['Main Weapon', 'Secondary Weapon', 'Awakening'],
  Armor: ['Helmet', 'Body Armor', 'Gloves', 'Shoes', 'Awakening Weapon'],
  Accessory: ['Necklace', 'Ring', 'Earring', 'Belt', 'Consumables'],
}

export default function GearFormModal({ item, onClose }: Props) {
  const isEdit = item !== null

  const [form, setForm] = useState({
    name: item?.name ?? '',
    category: item?.category ?? 'Weapon',
    subcategory: item?.subcategory ?? '',
    tier: item?.tier ?? 'DUO',
    enhance: item?.enhance ?? 0,
    ap: item?.ap ?? 0,
    dp: item?.dp ?? 0,
    accuracy: item?.accuracy ?? 0,
    evasion: item?.evasion ?? 0,
    critRate: item?.critRate ?? 0,
    priceG: item?.priceG ? Number(item.priceG).toString() : '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Validación básica
  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'El nombre es requerido'
    if (!form.category) errs.category = 'Categoría requerida'
    if (!form.tier) errs.tier = 'Tier requerido'
    if (form.enhance < 0 || form.enhance > 25) errs.enhance = 'Enhance 0-25'
    if (form.ap < 0) errs.ap = 'No puede ser negativo'
    if (form.dp < 0) errs.dp = 'No puede ser negativo'
    if (form.priceG && isNaN(Number(form.priceG))) errs.priceG = 'Precio inválido'
    return errs
  }

  // Manejar submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    try {
      const data = {
        name: form.name.trim(),
        category: form.category,
        subcategory: form.subcategory || null,
        tier: form.tier,
        enhance: Number(form.enhance),
        ap: Number(form.ap),
        dp: Number(form.dp),
        accuracy: Number(form.accuracy),
        evasion: Number(form.evasion),
        critRate: Number(form.critRate),
        priceG: form.priceG ? BigInt(Math.floor(Number(form.priceG))) : null,
        source: 'manual',
      }

      if (isEdit && item) {
        await updateGear(item.id, data)
      } else {
        await createGear(data)
      }

      // Cerrar modal — revalidatePath('/') en la server action revalidará los datos
      onClose()
    } catch (err) {
      console.error('Error al guardar gear:', err)
      setErrors({ form: 'Error al guardar. Intenta de nuevo.' })
    } finally {
      setSubmitting(false)
    }
  }

  // Cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const inputClass = (field: string) =>
    `form-input ${errors[field] ? 'form-input-error' : ''}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? '✏️ Editar Item' : '➕ Añadir Item'}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="modal-form">
          {errors.form && (
            <div className="form-error-banner">{errors.form}</div>
          )}

          {/* Nombre */}
          <div className="form-group">
            <label className="form-label">Nombre del Item *</label>
            <input
              type="text"
              className={inputClass('name')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Kzarka Longbow"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Categoría + Subcategoría */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select
                className={inputClass('category')}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: '' })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Subcategoría</label>
              <select
                className="form-input"
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
              >
                <option value="">— Sin especificar —</option>
                {(SUBCATEGORIES[form.category] || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tier + Enhancement */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tier *</label>
              <select
                className={inputClass('tier')}
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.tier && <span className="form-error">{errors.tier}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Enhancement (0-25)</label>
              <input
                type="number"
                className={inputClass('enhance')}
                value={form.enhance}
                min={0}
                max={25}
                onChange={(e) => setForm({ ...form, enhance: Number(e.target.value) })}
              />
              {errors.enhance && <span className="form-error">{errors.enhance}</span>}
            </div>
          </div>

          {/* AP + DP */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">AP</label>
              <input
                type="number"
                className={inputClass('ap')}
                value={form.ap}
                min={0}
                onChange={(e) => setForm({ ...form, ap: Number(e.target.value) })}
              />
              {errors.ap && <span className="form-error">{errors.ap}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">DP</label>
              <input
                type="number"
                className={inputClass('dp')}
                value={form.dp}
                min={0}
                onChange={(e) => setForm({ ...form, dp: Number(e.target.value) })}
              />
              {errors.dp && <span className="form-error">{errors.dp}</span>}
            </div>
          </div>

          {/* ACC + EVA + Crit */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Accuracy</label>
              <input
                type="number"
                className="form-input"
                value={form.accuracy}
                min={0}
                onChange={(e) => setForm({ ...form, accuracy: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Evasion</label>
              <input
                type="number"
                className="form-input"
                value={form.evasion}
                min={0}
                onChange={(e) => setForm({ ...form, evasion: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Crit Rate (%)</label>
              <input
                type="number"
                className="form-input"
                value={form.critRate}
                min={0}
                max={100}
                onChange={(e) => setForm({ ...form, critRate: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Precio */}
          <div className="form-group">
            <label className="form-label">Precio (silver)</label>
            <input
              type="text"
              className={inputClass('priceG')}
              value={form.priceG}
              onChange={(e) => setForm({ ...form, priceG: e.target.value })}
              placeholder="Ej: 12500000000 (sin comas ni letras B/M)"
            />
            {errors.priceG && <span className="form-error">{errors.priceG}</span>}
            <span className="form-hint">
              Ingresa el precio en silver (sin B/M). Ej: 1_500_000_000 = 1.5B
            </span>
          </div>

          {/* Acciones */}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : isEdit ? '💾 Guardar Cambios' : '➕ Crear Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
