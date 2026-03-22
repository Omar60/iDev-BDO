import type { Metadata } from 'next'
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
      <body>{children}</body>
    </html>
  )
}
