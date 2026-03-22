'use server'

import Papa from 'papaparse'

/**
 * Resultado de una búsqueda en el sheet
 */
export type SheetSearchResult = {
  name: string
  priceG: number | null
}

/**
 * Busca items en el CSV de Google Sheets por nombre.
 * Retorna hasta 5 resultados cuyo nombre contenga el query (case-insensitive).
 */
export async function searchFromSheets(query: string): Promise<SheetSearchResult[]> {
  if (!query || query.trim().length < 2) return []

  const csvUrl =
    'https://docs.google.com/spreadsheets/d/1NsGi5c648KgnCyLdYWvtfkr36zjXK6FdBFxMjVQ_-9I/export?format=csv&gid=0'

  try {
    const response = await fetch(csvUrl)
    if (!response.ok) return []

    const csvText = await response.text()

    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true
    })

    if (parsed.errors.length > 0) return []

    const rows = parsed.data as unknown[][]
    const firstRow = rows[0]
    const hasHeader =
      firstRow &&
      typeof firstRow[0] === 'string' &&
      /nombre|itemid|stock/i.test(String(firstRow[0]))

    const dataRows = hasHeader ? rows.slice(1) : rows

    const queryLower = query.toLowerCase().trim()
    const results: SheetSearchResult[] = []

    for (const row of dataRows) {
      const nameRaw = row[0]
      const priceRaw = row[4]

      const name = typeof nameRaw === 'string' ? nameRaw.trim() : String(nameRaw ?? '').trim()

      if (!name || !name.toLowerCase().includes(queryLower)) continue

      let priceG: number | null = null
      if (priceRaw !== null && priceRaw !== undefined && priceRaw !== '') {
        const parsedPrice = parseInt(String(priceRaw).trim(), 10)
        if (!isNaN(parsedPrice)) {
          priceG = parsedPrice
        }
      }

      results.push({ name, priceG })

      if (results.length >= 5) break
    }

    return results
  } catch {
    return []
  }
}
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

/**
 * Resultado de importar desde sheets
 */
export type SheetsImportResult = {
  success: boolean
  imported: number
  updated: number
  errors: string[]
}

/**
 * Importa gear desde Google Sheets CSV público.
 * Columnas esperadas: Nombre(0), ItemID(1), Stock(2), Transacciones(3), Precio(4), PrecioMax(5), ?(6)
 *
 * - Nombre se guarda tal cual (ej: "[Archer] Arctic Fang Armor")
 * - Precio viene en silver como entero (ej: 880000000 = 880M)
 * - Upsert por nombre exacto
 */
export async function importFromSheets(): Promise<SheetsImportResult> {
  const result: SheetsImportResult = {
    success: false,
    imported: 0,
    updated: 0,
    errors: []
  }

  const csvUrl =
    'https://docs.google.com/spreadsheets/d/1NsGi5c648KgnCyLdYWvtfkr36zjXK6FdBFxMjVQ_-9I/export?format=csv&gid=0'

  try {
    // Fetch del CSV
    console.log('[Sheets Import] Descargando CSV desde Google Sheets...')
    const response = await fetch(csvUrl)
    if (!response.ok) {
      result.errors.push(
        `Error al descargar CSV: ${response.status} ${response.statusText}`
      )
      return result
    }

    const csvText = await response.text()
    console.log(`[Sheets Import] CSV recibido: ${csvText.length} caracteres`)

    // Parsear sin headers — usamos índices de columna
    // Formato: Nombre(0), ItemID(1), Stock(2), Transacciones(3), Precio(4), PrecioMax(5), ?(6)
    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true
    })

    if (parsed.errors.length > 0) {
      parsed.errors.forEach((err) => {
        result.errors.push(`Error de parsing en fila ${err.row}: ${err.message}`)
      })
    }

    const rows = parsed.data as unknown[][]
    console.log(`[Sheets Import] Total filas parseadas: ${rows.length}`)

    // Primera fila suele ser header, verificamos si parece texto
    const firstRow = rows[0]
    const hasHeader =
      firstRow &&
      typeof firstRow[0] === 'string' &&
      /nombre|itemid|stock/i.test(String(firstRow[0]))

    // Si la primera fila es header, empezar desde la fila 1
    const dataRows = hasHeader ? rows.slice(1) : rows
    console.log(`[Sheets Import] Filas de datos: ${dataRows.length} (header detectada: ${hasHeader})`)

    if (dataRows.length === 0) {
      result.errors.push('No se encontraron datos en el CSV')
      return result
    }

    // Procesar cada fila
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNum = i + 2 + (hasHeader ? 1 : 0)

      try {
        const nameRaw = row[0]
        const priceRaw = row[4]

        // Validar nombre
        const name = typeof nameRaw === 'string' ? nameRaw.trim() : String(nameRaw ?? '').trim()
        if (!name) {
          result.errors.push(`Fila ${rowNum}: Nombre vacío, saltando`)
          continue
        }

        // Parsear precio — viene como entero en silver
        let priceG: bigint | null = null
        if (priceRaw !== null && priceRaw !== undefined && priceRaw !== '') {
          const parsedPrice = parseInt(String(priceRaw).trim(), 10)
          if (!isNaN(parsedPrice)) {
            priceG = BigInt(parsedPrice)
          }
        }

        // Verificar si ya existe para distinguir import vs update
        const existing = await prisma.gear.findUnique({ where: { name } })

        // Upsert por nombre exacto
        await prisma.gear.upsert({
          where: { name },
          update: {
            priceG,
            source: 'sheets',
            lastUpdated: new Date()
          },
          create: {
            name,
            category: 'Accessory', // Valor por defecto — sheets no tiene categoría
            tier: 'base',
            enhance: 0,
            ap: 0,
            dp: 0,
            accuracy: 0,
            evasion: 0,
            critRate: 0,
            priceG,
            source: 'sheets',
            lastUpdated: new Date()
          }
        })

        if (existing) {
          result.updated++
          console.log(`[Sheets Import] Actualizado: ${name}`)
        } else {
          result.imported++
          console.log(`[Sheets Import] Importado: ${name}`)
        }
      } catch (rowErr) {
        console.error(`[Sheets Import] Error fila ${rowNum}:`, rowErr)
        result.errors.push(
          `Fila ${rowNum}: Error procesando - ${String(rowErr)}`
        )
      }
    }

    console.log(`[Sheets Import] Resultado: ${result.imported} nuevos, ${result.updated} actualizados, ${result.errors.length} errores`)
    result.success = result.errors.length === 0

    revalidatePath('/')
  } catch (err) {
    result.errors.push(`Error general: ${String(err)}`)
  }

  return result
}

/**
 * Valida una URL de Google Sheets CSV
 */
export async function validateSheetsUrl(
  url: string
): Promise<{ valid: boolean; error?: string }> {
  if (!url) {
    return { valid: false, error: 'URL vacía' }
  }

  if (!url.startsWith('http')) {
    return { valid: false, error: 'Debe ser una URL HTTP/HTTPS' }
  }

  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (!response.ok) {
      return { valid: false, error: `URL no accesible (${response.status})` }
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('csv') && !contentType.includes('text/plain')) {
      return {
        valid: false,
        error: 'La URL no parece ser un CSV (content-type diferente)'
      }
    }

    return { valid: true }
  } catch (err) {
    return { valid: false, error: `No se pudo validar la URL: ${String(err)}` }
  }
}
