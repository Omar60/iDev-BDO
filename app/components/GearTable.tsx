'use client';

// ============================================================
// GearTable — Tabla de items de gear (Client Component)
// Recibe datos como props desde page.tsx (Server Component)
// ============================================================

import { useState } from 'react'
import { GearItem } from '@/app/actions/gear'
import { deleteGear } from '@/app/actions/gear'
import { importFromSheets } from '@/app/actions/sheets'
import GearFormModal from './GearFormModal'

type Props = {
  items: GearItem[]
}

export function GearTable({ items }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GearItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  // Datos para stats
  const totalAP = items.reduce((sum, item) => sum + item.ap, 0)
  const totalDP = items.reduce((sum, item) => sum + item.dp, 0)
  const totalAccuracy = items.reduce((sum, item) => sum + item.accuracy, 0)
  const totalEvasion = items.reduce((sum, item) => sum + item.evasion, 0)
  const penCount = items.filter((i) => i.tier === 'PEN').length

  // Filtro por categoría
  const filteredItems = activeCategory
    ? items.filter((i) => i.category === activeCategory)
    : items

  const categories = ['Weapon', 'Armor', 'Accessory']

  // Formatear precio BigInt a string
  const formatPrice = (priceG: bigint | null | undefined) => {
    if (!priceG) return '—'
    const num = Number(priceG)
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
    return num.toLocaleString()
  }

  // Enhancement display
  const formatEnhance = (val: number) => (val > 0 ? `+${val}` : '—')

  // Emoji por categoría
  const getCategoryEmoji = (cat: string) => {
    if (cat === 'Weapon') return '🗡️'
    if (cat === 'Armor') return '🛡️'
    return '💍'
  }

  // Color de categoría
  const getCategoryClass = (cat: string) => {
    if (cat === 'Weapon') return 'category-weapon'
    if (cat === 'Armor') return 'category-armor'
    return 'category-accessory'
  }

  // Abrir modal para editar
  const handleEdit = (item: GearItem) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  // Abrir modal para crear
  const handleAdd = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingItem(null)
  }

  // Eliminar item
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este item de gear?')) {
      await deleteGear(id)
    }
  }

  // Importar desde Google Sheets
  const handleImportFromSheets = async () => {
    setImporting(true)
    try {
      await importFromSheets()
      window.location.reload()
    } catch (error) {
      console.error('Import failed:', error)
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      {/* MODAL DE ADD/EDIT */}
      {modalOpen && (
        <GearFormModal
          item={editingItem}
          onClose={handleCloseModal}
        />
      )}

      <main className="main">
        {/* Nota de referencia */}
        <div className="reference-note">
          💡 <strong style={{ color: '#9ca3af' }}>Referencia de diseño:</strong> Garmoth.com
          (bloqueado 403) — UI analizada vía búsqueda web. Inspirado en su gear planner:
          slots de gear, stats breakdown (AP/DP/ACC/EVA), sistema de tiers, estética oscura
          con acentos dorados (#fbbf24) y púrpura (#c084fc).
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeCategory === null ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            📋 Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${activeCategory === cat ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'Weapon' && '⚔️ '}
              {cat === 'Armor' && '🛡️ '}
              {cat === 'Accessory' && '💍 '}
              {cat}
            </button>
          ))}
          <button className="tab-btn tab-btn-add" onClick={handleAdd}>
            ➕ Add Item
          </button>
          <button className="tab-btn" onClick={handleImportFromSheets} disabled={importing}>
            {importing ? '⏳ Importando...' : '📥 Import from Sheets'}
          </button>
        </div>

        {/* Tabla de Gear */}
        <div className="gear-table">
          <div className="gear-table-header">
            <span>Item</span>
            <span style={{ textAlign: 'center' }}>Category</span>
            <span style={{ textAlign: 'center' }}>Tier</span>
            <span style={{ textAlign: 'center' }}>Enhance</span>
            <span style={{ textAlign: 'center' }} className="stat-ap">AP</span>
            <span style={{ textAlign: 'center' }} className="stat-dp">DP</span>
            <span style={{ textAlign: 'center' }}>ACC</span>
            <span style={{ textAlign: 'center' }}>EVA</span>
            <span style={{ textAlign: 'center' }}>CRIT</span>
            <span style={{ textAlign: 'center' }}>Price</span>
            <span style={{ textAlign: 'center' }}>Actions</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="gear-row-empty">
              No hay items en esta categoría. ¡Añade tu primer gear! ⚔️
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="gear-row">
                {/* Nombre + icono */}
                <div className="gear-item-name">
                  <div className="gear-item-icon">{getCategoryEmoji(item.category)}</div>
                  <div className="gear-item-info">
                    <div className="gear-item-name-text">{item.name}</div>
                    <div className="gear-item-subcategory">{item.subcategory || '—'}</div>
                  </div>
                </div>

                {/* Categoría */}
                <div className="gear-cell-center">
                  <span className={`category-badge ${getCategoryClass(item.category)}`}>
                    {item.category}
                  </span>
                </div>

                {/* Tier */}
                <div className="gear-cell-center">
                  <span className={`tier-badge tier-${item.tier}`}>{item.tier}</span>
                </div>

                {/* Enhancement */}
                <div className="gear-cell-center enhance-text">{formatEnhance(item.enhance)}</div>

                {/* AP */}
                <div className="gear-cell-center">
                  <span className={item.ap > 0 ? 'stat-ap' : 'stat-neutral'}>
                    {item.ap > 0 ? item.ap : '—'}
                  </span>
                </div>

                {/* DP */}
                <div className="gear-cell-center">
                  <span className={item.dp > 0 ? 'stat-dp' : 'stat-neutral'}>
                    {item.dp > 0 ? item.dp : '—'}
                  </span>
                </div>

                {/* ACC */}
                <div className="gear-cell-center">
                  <span className="stat-neutral">
                    {item.accuracy > 0 ? item.accuracy : '—'}
                  </span>
                </div>

                {/* EVA */}
                <div className="gear-cell-center">
                  <span className="stat-neutral">
                    {item.evasion > 0 ? item.evasion : '—'}
                  </span>
                </div>

                {/* CRIT */}
                <div className="gear-cell-center">
                  <span className="stat-neutral">
                    {item.critRate > 0 ? `${item.critRate}%` : '—'}
                  </span>
                </div>

                {/* Precio */}
                <div className="gear-cell-center">
                  <span className="stat-price">💰 {formatPrice(item.priceG)}</span>
                </div>

                {/* Acciones */}
                <div className="action-btns">
                  <button className="action-btn" onClick={() => handleEdit(item)}>✏️</button>
                  <button className="action-btn danger" onClick={() => handleDelete(item.id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-card-title">⚔️ Attack Stats</h3>
            <div className="stat-row">
              <span className="stat-row-label">Total AP</span>
              <span className="stat-row-value stat-row-value ap">{totalAP}</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">Accuracy</span>
              <span className="stat-row-value">{totalAccuracy}</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">Critical Rate</span>
              <span className="stat-row-value">
                {items.length > 0 ? Math.round(items.reduce((s, i) => s + i.critRate, 0) / items.length) : 0}%
              </span>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-card-title">🛡️ Defense Stats</h3>
            <div className="stat-row">
              <span className="stat-row-label">Total DP</span>
              <span className="stat-row-value stat-row-value dp">{totalDP}</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">Evasion</span>
              <span className="stat-row-value">{totalEvasion}</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">Damage Reduction</span>
              <span className="stat-row-value">—</span>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-card-title">💰 Estimated Value</h3>
            <div className="stat-row">
              <span className="stat-row-label">Total Gear Value</span>
              <span className="stat-row-value stat-row-value gold">
                {(() => {
                  const total = items.reduce((sum, i) => sum + Number(i.priceG || 0), 0)
                  if (total >= 1_000_000_000) return `~${(total / 1_000_000_000).toFixed(1)}B`
                  if (total >= 1_000_000) return `~${(total / 1_000_000).toFixed(1)}M`
                  return `~${total.toLocaleString()}`
                })()}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">Items</span>
              <span className="stat-row-value">{items.length}</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">PEN Items</span>
              <span className="stat-row-value stat-row-value yellow">{penCount}</span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
