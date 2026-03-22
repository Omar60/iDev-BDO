'use client';

import { useIDevEasterEgg, EasterEggModal } from './components/iDevEasterEgg';

// ============================================================
// iDev.BDO-GEAR — Página principal de gear tracker
// Inspirado en Garmoth.com (gear planner UI)
// Garmoth.com bloqueado (403) — UI analizada vía búsqueda web.
// Referencias de diseño encontradas:
// - Gear slots organizados por categoría (Weapon, Armor, Accessories)
// - Stats breakdown: AP, DP, Accuracy, Evasion, Crit Damage
// - Sistema de tiers: PEN > TRI > DUO > PRI > base
// - Dark theme con acentos dorados/púrpura (estética BDO)
// - Precio en silver por item
// Easter Egg: clickea el logo 5 veces o escribe "iDevotion" en la consola
// ============================================================

export default function Home() {
  const { active: easterEggActive, close: closeEasterEgg, handleLogoClick, logoClicks } = useIDevEasterEgg();

  // Datos de ejemplo hardcodeados (fake BDO items)
  const gearItems = [
    {
      id: 1,
      name: "Kzarka Longbow",
      category: "Weapon",
      subcategory: "Main Weapon",
      tier: "PEN",
      enhancement: "+25",
      ap: 140,
      dp: 0,
      accuracy: 0,
      evasion: 0,
      critRate: 0,
      price: "12,500,000,000",
      image: "🗡️",
    },
    {
      id: 2,
      name: "Dim Tree Spirit Armor",
      category: "Armor",
      subcategory: "Body Armor",
      tier: "PEN",
      enhancement: "+20",
      ap: 0,
      dp: 127,
      accuracy: 0,
      evasion: 26,
      critRate: 0,
      price: "8,200,000,000",
      image: "🛡️",
    },
    {
      id: 3,
      name: "Ogre Ring",
      category: "Accessory",
      subcategory: "Ring",
      tier: "TRI",
      enhancement: "+15",
      ap: 14,
      dp: 0,
      accuracy: 0,
      evasion: 0,
      critRate: 0,
      price: "1,800,000,000",
      image: "💍",
    },
    {
      id: 4,
      name: "Tungrad Necklace",
      category: "Accessory",
      subcategory: "Necklace",
      tier: "DUO",
      enhancement: "+14",
      ap: 0,
      dp: 10,
      accuracy: 5,
      evasion: 0,
      critRate: 0,
      price: "950,000,000",
      image: "📿",
    },
    {
      id: 5,
      name: "Griffon Helm",
      category: "Armor",
      subcategory: "Helmet",
      tier: "PEN",
      enhancement: "+22",
      ap: 0,
      dp: 101,
      accuracy: 0,
      evasion: 16,
      critRate: 0,
      price: "5,600,000,000",
      image: "⛑️",
    },
  ];

  const categories = ["Weapon", "Armor", "Accessory"];
  const totalAP = gearItems.reduce((sum, item) => sum + item.ap, 0);
  const totalDP = gearItems.reduce((sum, item) => sum + item.dp, 0);
  const totalAccuracy = gearItems.reduce((sum, item) => sum + item.accuracy, 0);
  const totalEvasion = gearItems.reduce((sum, item) => sum + item.evasion, 0);
  const penCount = gearItems.filter((i) => i.tier === "PEN").length;

  const getCategoryClass = (cat: string) => {
    if (cat === "Weapon") return "category-weapon";
    if (cat === "Armor") return "category-armor";
    return "category-accessory";
  };

  // Tooltip para el easter egg
  const easterEggHint = logoClicks > 0
    ? `${5 - logoClicks} más... 😏`
    : null;

  return (
    <div>
      {/* EASTER EGG MODAL */}
      {easterEggActive && <EasterEggModal onClose={closeEasterEgg} />}

      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <div>
            {/* Logo clickeable — easter egg trigger */}
            <h1
              className="header-title"
              onClick={handleLogoClick}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title={easterEggHint || '⚔️ iDev.BDO-GEAR'}
            >
              <span>⚔️ </span>
              <span className="header-title-idev">iDev</span>
              <span className="header-title-bdo">.BDO-GEAR</span>
              {/* Hint visual cuando empiezan a hacer click */}
              {logoClicks > 0 && (
                <span style={{ fontSize: '12px', marginLeft: '6px', verticalAlign: 'middle' }}>
                  {Array.from({ length: logoClicks }).map((_, i) => '👅').join('')}
                </span>
              )}
            </h1>
            <p className="header-subtitle">
              Black Desert Online — Gear Tracker & Planner
            </p>
          </div>
          <div className="header-stats">
            <div className="header-stat-box">
              <div className="header-stat-value ap">{totalAP}</div>
              <div className="header-stat-label">Total AP</div>
            </div>
            <div className="header-stat-box">
              <div className="header-stat-value dp">{totalDP}</div>
              <div className="header-stat-label">Total DP</div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="main">
        {/* Nota de referencia */}
        <div className="reference-note">
          💡 <strong style={{ color: "#9ca3af" }}>Referencia de diseño:</strong> Garmoth.com
          (bloqueado 403) — UI analizada vía búsqueda web. Inspirado en su gear planner:
          slots de gear, stats breakdown (AP/DP/ACC/EVA), sistema de tiers, estética oscura
          con acentos dorados (#fbbf24) y púrpura (#c084fc).
        </div>

        {/* Tabs */}
        <div className="tabs">
          {categories.map((cat) => (
            <button key={cat} className="tab-btn">
              {cat === "Weapon" && "⚔️ "}
              {cat === "Armor" && "🛡️ "}
              {cat === "Accessory" && "💍 "}
              {cat}
            </button>
          ))}
          <button className="tab-btn tab-btn-add">
            ➕ Add Item
          </button>
        </div>

        {/* Tabla de Gear */}
        <div className="gear-table">
          <div className="gear-table-header">
            <span>Item</span>
            <span style={{ textAlign: "center" }}>Category</span>
            <span style={{ textAlign: "center" }}>Tier</span>
            <span style={{ textAlign: "center" }}>Enhance</span>
            <span style={{ textAlign: "center" }} className="stat-ap">AP</span>
            <span style={{ textAlign: "center" }} className="stat-dp">DP</span>
            <span style={{ textAlign: "center" }}>ACC</span>
            <span style={{ textAlign: "center" }}>EVA</span>
            <span style={{ textAlign: "center" }}>Price</span>
            <span style={{ textAlign: "center" }}>Actions</span>
          </div>

          {gearItems.map((item) => (
            <div key={item.id} className="gear-row">
              {/* Nombre + icono */}
              <div className="gear-item-name">
                <div className="gear-item-icon">{item.image}</div>
                <div className="gear-item-info">
                  <div className="gear-item-name-text">{item.name}</div>
                  <div className="gear-item-subcategory">{item.subcategory}</div>
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
              <div className="gear-cell-center enhance-text">{item.enhancement}</div>

              {/* AP */}
              <div className="gear-cell-center">
                <span className={item.ap > 0 ? "stat-ap" : "stat-neutral"}>
                  {item.ap > 0 ? item.ap : "—"}
                </span>
              </div>

              {/* DP */}
              <div className="gear-cell-center">
                <span className={item.dp > 0 ? "stat-dp" : "stat-neutral"}>
                  {item.dp > 0 ? item.dp : "—"}
                </span>
              </div>

              {/* ACC */}
              <div className="gear-cell-center">
                <span className={item.accuracy > 0 ? "stat-neutral" : "stat-neutral"}>
                  {item.accuracy > 0 ? item.accuracy : "—"}
                </span>
              </div>

              {/* EVA */}
              <div className="gear-cell-center">
                <span className={item.evasion > 0 ? "stat-neutral" : "stat-neutral"}>
                  {item.evasion > 0 ? item.evasion : "—"}
                </span>
              </div>

              {/* Precio */}
              <div className="gear-cell-center">
                <span className="stat-price">💰 {item.price}</span>
              </div>

              {/* Acciones */}
              <div className="action-btns">
                <button className="action-btn">✏️</button>
                <button className="action-btn danger">🗑️</button>
              </div>
            </div>
          ))}
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
              <span className="stat-row-value">—</span>
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
              <span className="stat-row-value stat-row-value gold">~29B</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">Items</span>
              <span className="stat-row-value">{gearItems.length}</span>
            </div>
            <div className="stat-row">
              <span className="stat-row-label">PEN Items</span>
              <span className="stat-row-value stat-row-value yellow">{penCount}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
