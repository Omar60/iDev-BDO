'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================
// Easter Egg de iDevotion — BDO-GEAR
// Activadores:
//   1. Escribir "iDevotion" en la consola del navegador
//   2. Clickear el logo del header 5 veces
// Muestra imagen sugerente + mensajehot de iDevotion
// ============================================================

const ID_EASTER_EGG_KEY = 'idevotion-activated';

// Mensaje hot de iDevotion
const HOT_MESSAGE = "¿Buscando algo más interesante que el gear, mi niño? 😈🔥";

// SVG inline como string — sin newlines problemáticos para encoding
// Los elementos SVG se escriben sin espacios indentation internos
const EASTER_EGG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560"><defs><radialGradient id="bg" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#1a0533"/><stop offset="100%" stop-color="#0a0614"/></radialGradient><radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#c084fc" stop-opacity="0.6"/><stop offset="100%" stop-color="#c084fc" stop-opacity="0"/></radialGradient><linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient><linearGradient id="armor" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#7c3aed"/><stop offset="50%" stop-color="#a855f7"/><stop offset="100%" stop-color="#6d28d9"/></linearGradient><linearGradient id="armor-shine" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0"/><stop offset="40%" stop-color="#ffffff" stop-opacity="0.3"/><stop offset="60%" stop-color="#ffffff" stop-opacity="0.3"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient><filter id="glow-filter"><feGaussianBlur stdDeviation="6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="400" height="560" fill="url(#bg)"/><ellipse cx="200" cy="240" rx="140" ry="180" fill="url(#glow)"/><path d="M155 200 Q140 210 135 250 Q130 280 145 310 L160 310 L160 260 Q160 240 175 230 Q190 220 200 220 Q210 220 225 230 Q240 240 240 260 L240 310 L255 310 Q270 280 265 250 Q260 210 245 200 Q225 190 200 190 Q175 190 155 200Z" fill="url(#armor)"/><path d="M155 200 Q140 210 135 250 Q130 280 145 310 L160 310 L160 260 Q160 240 175 230 Q190 220 200 220 Q210 220 225 230 Q240 240 240 260 L240 310 L255 310 Q270 280 265 250 Q260 210 245 200 Q225 190 200 190 Q175 190 155 200Z" fill="url(#armor-shine)"/><path d="M160 200 Q155 180 165 160 L175 165 Q170 185 172 200Z" fill="#8b5cf6"/><path d="M240 200 Q245 180 235 160 L225 165 Q230 185 228 200Z" fill="#8b5cf6"/><ellipse cx="155" cy="220" rx="8" ry="8" fill="#fbbf24" filter="url(#glow-filter)"/><ellipse cx="245" cy="220" rx="8" ry="8" fill="#fbbf24" filter="url(#glow-filter)"/><ellipse cx="200" cy="265" rx="10" ry="10" fill="#f472b6" filter="url(#glow-filter)"/><path d="M160 310 Q155 320 150 340 Q145 360 155 380 L245 380 Q255 360 250 340 Q245 320 240 310Z" fill="url(#armor)"/><path d="M160 310 Q155 320 150 340 Q145 360 155 380 L245 380 Q255 360 250 340 Q245 320 240 310Z" fill="url(#armor-shine)"/><path d="M155 380 Q148 420 150 460 Q152 490 155 520 L180 520 Q178 490 177 460 Q176 420 180 380Z" fill="url(#skin)"/><path d="M245 380 Q252 420 250 460 Q248 490 245 520 L220 520 Q222 490 223 460 Q224 420 220 380Z" fill="url(#skin)"/><path d="M135 250 Q120 260 110 290 Q108 310 115 320 Q125 315 130 300 Q138 275 145 265Z" fill="url(#skin)"/><path d="M265 250 Q280 260 290 290 Q292 310 285 320 Q275 315 270 300 Q262 275 255 265Z" fill="url(#skin)"/><ellipse cx="148" cy="205" rx="22" ry="14" fill="#7c3aed" transform="rotate(-15 148 205)"/><ellipse cx="252" cy="205" rx="22" ry="14" fill="#7c3aed" transform="rotate(15 252 205)"/><ellipse cx="148" cy="205" rx="22" ry="14" fill="url(#armor-shine)" transform="rotate(-15 148 205)"/><ellipse cx="252" cy="205" rx="22" ry="14" fill="url(#armor-shine)" transform="rotate(15 252 205)"/><rect x="188" y="150" width="24" height="45" rx="10" fill="url(#skin)"/><ellipse cx="200" cy="135" rx="38" ry="42" fill="url(#skin)"/><path d="M162 135 Q158 110 175 95 Q190 82 200 82 Q210 82 225 95 Q242 110 238 135 Q240 120 235 105 Q228 88 200 88 Q172 88 165 105 Q160 120 162 135Z" fill="#4c1d95"/><path d="M162 135 Q155 150 150 175 Q148 190 152 200 Q158 195 160 185 Q163 165 165 150 Q168 140 162 135Z" fill="#5b21b6"/><path d="M238 135 Q245 150 250 175 Q252 190 248 200 Q242 195 240 185 Q237 165 235 150 Q232 140 238 135Z" fill="#5b21b6"/><ellipse cx="186" cy="133" rx="8" ry="6" fill="#1e1b4b"/><ellipse cx="214" cy="133" rx="8" ry="6" fill="#1e1b4b"/><ellipse cx="188" cy="132" rx="3" ry="3" fill="#c084fc"/><ellipse cx="216" cy="132" rx="3" ry="3" fill="#c084fc"/><ellipse cx="189" cy="131" rx="1.5" ry="1.5" fill="#ffffff"/><ellipse cx="217" cy="131" rx="1.5" ry="1.5" fill="#ffffff"/><path d="M194 152 Q200 158 206 152" stroke="#be185d" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="162" cy="138" rx="5" ry="8" fill="#fde68a"/><ellipse cx="238" cy="138" rx="5" ry="8" fill="#fde68a"/><rect x="285" y="200" width="6" height="120" rx="3" fill="#94a3b8"/><rect x="283" y="200" width="10" height="6" rx="2" fill="#64748b"/><path d="M288 200 L288 175 L285 165 L288 155 L291 165 L288 175Z" fill="#e2e8f0"/><circle cx="288" cy="325" r="10" fill="#7c3aed"/><circle cx="288" cy="325" r="6" fill="#a855f7"/><circle cx="120" cy="100" r="3" fill="#fbbf24" opacity="0.8"/><circle cx="280" cy="80" r="2" fill="#f472b6" opacity="0.9"/><circle cx="310" cy="150" r="2.5" fill="#c084fc" opacity="0.7"/><circle cx="90" cy="180" r="2" fill="#fbbf24" opacity="0.6"/><circle cx="320" cy="220" r="3" fill="#fbbf24" opacity="0.5"/><text x="200" y="545" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-style="italic" fill="#c084fc" opacity="0.9">~ iDevotion ~</text></svg>`;

// Buffer-compatible encoding (funciona en Node.js sin InvalidCharacterError)
const PLACEHOLDER_SVG = `data:image/svg+xml;base64,${Buffer.from(EASTER_EGG_SVG).toString('base64')}`;

// -------------------------------------------------------
// Componente del modal del easter egg
// -------------------------------------------------------
function EasterEggModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1a0533 0%, #0d0618 100%)',
          border: '2px solid #7c3aed',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '480px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(124, 58, 237, 0.5), 0 0 120px rgba(192, 132, 252, 0.2)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#c084fc',
            fontSize: '22px',
            cursor: 'pointer',
            lineHeight: 1,
            opacity: 0.7,
          }}
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Imagen sugerente */}
        <div style={{ marginBottom: '16px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #6d28d9' }}>
          <img
            src={PLACEHOLDER_SVG}
            alt="iDevotion — warrior femme"
            style={{ width: '100%', display: 'block' }}
          />
        </div>

        {/* Mensaje hot */}
        <p style={{
          color: '#f9a8d4',
          fontSize: '18px',
          fontStyle: 'italic',
          margin: '0 0 8px 0',
          textShadow: '0 0 10px rgba(249, 168, 212, 0.5)',
        }}>
          {HOT_MESSAGE}
        </p>

        {/* Subtexto */}
        <p style={{
          color: '#6d28d9',
          fontSize: '13px',
          margin: 0,
          opacity: 0.8,
        }}>
          🔮 Easter egg de iDevotion — secreto total 🔮
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Hook: detecta easter egg
// -------------------------------------------------------
function useEasterEgg(onActivate: () => void) {
  // Konami-style: contador de clicks en el logo
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = useCallback(() => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 5) {
      onActivate();
      setLogoClicks(0);
    }
    // Reset si pasa mucho tiempo entre clicks (5 segundos)
    setTimeout(() => setLogoClicks((c) => (c >= 5 ? 0 : c)), 5000);
  }, [logoClicks, onActivate]);

  // Escucha el evento personalizado desde la consola
  useEffect(() => {
    const handler = () => onActivate();
    window.addEventListener('idevotion-easter-egg', handler);
    return () => window.removeEventListener('idevotion-easter-egg', handler);
  }, [onActivate]);

  return { handleLogoClick, logoClicks };
}

// -------------------------------------------------------
// Componente principal — exporta refs y handler
// -------------------------------------------------------
export function useIDevEasterEgg() {
  const [active, setActive] = useState(false);

  const activate = useCallback(() => {
    setActive(true);
    // Marcar en sessionStorage para no repetir
    try {
      if (!sessionStorage.getItem(ID_EASTER_EGG_KEY)) {
        sessionStorage.setItem(ID_EASTER_EGG_KEY, '1');
      }
    } catch (_) {}
  }, []);

  const { handleLogoClick, logoClicks } = useEasterEgg(activate);

  const close = useCallback(() => setActive(false), []);

  return { active, activate, close, handleLogoClick, logoClicks };
}

export { EasterEggModal };
