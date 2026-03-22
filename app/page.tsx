// ============================================================
// iDev.BDO-GEAR — Página principal (Server Component)
// Los datos reales se cargan desde Prisma/SQLite
// ============================================================

import { getGearItems } from '@/app/actions/gear'
import { GearTable } from '@/app/components/GearTable'
import { EasterEggLogo } from './components/EasterEggLogo'

// Versión de la aplicación — incrementar en cada deploy
const VERSION = '1.0.0'

// Esta página es 100% dinámica: datos de DB en runtime
// (no prerenderizar porque DATABASE_URL no existe en build time)
export const dynamic = 'force-dynamic'

export default async function Home() {
  // Obtener datos reales desde la base de datos
  const gearItems = await getGearItems()

  // Stats calculados desde DB
  const totalAP = gearItems.reduce((sum, item) => sum + item.ap, 0)
  const totalDP = gearItems.reduce((sum, item) => sum + item.dp, 0)

  return (
    <div>
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <div>
            <h1 className="header-title">
              <EasterEggLogo />
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

      {/* TABLE — Client Component */}
      <GearTable items={gearItems} />

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <span>BDO-GEAR v{VERSION}</span>
          <span>·</span>
          <span>iDevotion</span>
        </div>
      </footer>
    </div>
  )
}
