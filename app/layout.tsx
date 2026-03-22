import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'BDO-GEAR',
  description: 'Tracker de gear, crates y profit para Black Desert Online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}

        {/* ========================================
            Easter Egg de iDevotion
            Actívese escribiendo en la consola:
            window.dispatchEvent(new Event('idevotion-easter-egg'))
            o triggers alternativos desde la app
        ======================================== */}
        <Script id="idevotion-easter-hook" strategy="afterInteractive">{`
          (function() {
            // Interceptor de console.log — si alguien escribe "iDevotion"
            // en la consola, se activa el easter egg
            var originalLog = console.log;
            console.log = function() {
              var args = Array.prototype.slice.call(arguments);
              var str = args.map(function(a) { return String(a); }).join(' ');
              if (str.indexOf('iDevotion') !== -1 || str.indexOf('idevotion') !== -1) {
                window.dispatchEvent(new Event('idevotion-easter-egg'));
                // Feedback visual sutil
                var hint = document.createElement('div');
                hint.textContent = '😈';
                hint.style.cssText = 'position:fixed;bottom:20px;right:20px;font-size:32px;opacity:0;transition:opacity 0.3s;z-index:99999;pointer-events:none;';
                document.body.appendChild(hint);
                setTimeout(function() { hint.style.opacity = '1'; }, 50);
                setTimeout(function() { hint.style.opacity = '0'; }, 1500);
                setTimeout(function() { hint.remove(); }, 2000);
              }
              originalLog.apply(console, arguments);
            };

            // También exponer función directa para activar
            window.__iDevotion = function() {
              window.dispatchEvent(new Event('idevotion-easter-egg'));
            };

            console.log('%c⚔️ iDev.BDO-GEAR — ¿Buscando el secreto? 😏', 'color:#c084fc;font-size:16px;font-style:italic;');
          })();
        `}</Script>
      </body>
    </html>
  )
}
