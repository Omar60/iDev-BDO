'use client';

// ============================================================
// EasterEggLogo — Logo con easter egg (Client Component)
// Integración del easter egg de iDevotion
// ============================================================

import { useState, useCallback } from 'react'
import { EasterEggModal } from './iDevEasterEgg'

export function EasterEggLogo() {
  const [active, setActive] = useState(false)
  const [logoClicks, setLogoClicks] = useState(0)

  const handleLogoClick = useCallback(() => {
    const next = logoClicks + 1
    setLogoClicks(next)
    if (next >= 5) {
      setActive(true)
      setLogoClicks(0)
    }
    setTimeout(() => setLogoClicks((c) => (c >= 5 ? 0 : c)), 5000)
  }, [logoClicks])

  // Hint visual cuando empiezan a hacer click
  const easterEggHint = logoClicks > 0
    ? `${5 - logoClicks} más... 😏`
    : null

  return (
    <>
      {active && <EasterEggModal onClose={() => setActive(false)} />}
      <span
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={handleLogoClick}
        title={easterEggHint || '⚔️ iDev.BDO-GEAR'}
      >
        ⚔️{' '}
        <span className="header-title-idev">iDev</span>
        <span className="header-title-bdo">.BDO-GEAR</span>
        {logoClicks > 0 && (
          <span style={{ fontSize: '12px', marginLeft: '6px', verticalAlign: 'middle' }}>
            {Array.from({ length: logoClicks }).map((_, i) => '👅').join('')}
          </span>
        )}
      </span>
    </>
  )
}
