'use server'

import Papa from 'papaparse'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

/**
 *Resultado de importar desde sheets
 */
export type SheetsImportResult = {
  success: boolean
  imported: number
  updated: number
  errors: string[]
}

/**
 * Valida tier de BDO
 */
function validateTier(tier: string): string {
  const validTiers = ['PEN', 'TRI', 'DUO', 'PRI', 'base']
  const normalized = tier.toUpperCase().trim()
  return validTiers.includes(normalized) ? normalized : 'base'
}

/**
 * Valida categoría de BDO
 */
function validateCategory(category: string): string {
  const validCategories = ['Weapon', 'Armor', 'Accessory']
  const normalized = category.trim()
  return validCategories.includes(normalized) ? normalized : 'Accessory'
}

/**
 * Convierte string a número, maneja valores vacíos
 */
function parseNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  const parsed = parseInt(String(value), 10)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Convierte string de precio a BigInt (espera input en silver)
 * Acepta formatos como: "1.5B", "850M", "1200000000000"
 */
function parsePriceToBigInt(value: unknown): bigint | null {
  if (value === null || value === undefined || value === '') return null

  const str = String(value).trim().toUpperCase()

  // Si es un número directo, asumimos que son silver
  if (/^\d+$/.test(str)) {
    return BigInt(str)
  }

  // Formato con sufijos: 1.5B, 850M, 120K
  const match = str.match(/^([\d.]+)\s*(B|M|K)?$/)
  if (!match) return null

  let num = parseFloat(match[1])
  const suffix = match[2]

  switch (suffix) {
    case 'B':
      num *= 1_000_000_000
      break
    case 'M':
      num *= 1_000_000
      break
    case 'K':
      num *= 1_000
      break
    default:
      // Sin sufijo, devolver tal cual
      return BigInt(Math.floor(num))
  }

  return BigInt(Math.floor(num))
}

/**
 * Importa gear desde una URL CSV de Google Sheets
 * URL esperada: pública, compartida como CSV
 */
export async function importFromSheets(csvUrl: string): Promise<SheetsImportResult> {
  const result: SheetsImportResult = {
    success: false,
    imported: 0,
    updated: 0,
    errors: []
  }

  if (!csvUrl || !csvUrl.startsWith('http')) {
    result.errors.push('URL de CSV inválida o vacía')
    return result
  }

  try {
    // Fetch del CSV
    const response = await fetch(csvUrl)
    if (!response.ok) {
      result.errors.push(`Error al descargar CSV: ${response.status} ${response.statusText}`)
      return result
    }

    const csvText = await response.text()

    // Parsear CSV con papaparse
    const parsed = Papa.parse(csvText, {
      header: true,           // Primera fila como headers
      skipEmptyLines: true,  // Ignorar líneas vacías
      transformHeader: (header) => header.trim().toLowerCase() // Normalizar headers
    })

    if (parsed.errors.length > 0) {
      parsed.errors.forEach((err) => {
        result.errors.push(`Error de parsing en fila ${err.row}: ${err.message}`)
      })
    }

    const rows = parsed.data as Record<string, unknown>[]

    if (rows.length === 0) {
      result.errors.push('No se encontraron datos en el CSV')
      return result
    }

    // Procesar cada fila
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // +2 por header y 0-indexing

      try {
        const name = String(row.name || row.item || row.equipment || '').trim()
        if (!name) {
          result.errors.push(`Fila ${rowNum}: Nombre vacío, saltando`)
          continue
        }

        const data = {
          name,
          category: validateCategory(String(row.category || row.type || 'Accessory')),
          subcategory: row.subcategory ? String(row.subcategory).trim() : null,
          tier: validateTier(String(row.tier || row.enhance || 'base')),
          enhance: parseNumber(row.enhance || row.enhancement || row.enh),
          ap: parseNumber(row.ap || row.attack || row.p_attack || 0),
          dp: parseNumber(row.dp || row.defense || row.p_defense || 0),
          accuracy: parseNumber(row.accuracy || row.acc || 0),
          evasion: parseNumber(row.evasion || row.evas || row.ev || 0),
          critRate: parseNumber(row.critrate || row.crit || row.cr || 0),
          priceG: parsePriceToBigInt(row.price || row.priceg || row.silver || row.value || null),
          source: 'sheets',
          lastUpdated: new Date()
        }

        // Buscar si ya existe por nombre
        const existing = await prisma.gear.findFirst({
          where: { name: data.name }
        })

        if (existing) {
          // Actualizar existente
          await prisma.gear.update({
            where: { id: existing.id },
            data
          })
          result.updated++
        } else {
          // Crear nuevo
          await prisma.gear.create({ data })
          result.imported++
        }
      } catch (rowErr) {
        result.errors.push(`Fila ${rowNum}: Error procesando - ${String(rowErr)}`)
      }
    }

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
export async function validateSheetsUrl(url: string): Promise<{ valid: boolean; error?: string }> {
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
      return { valid: false, error: 'La URL no parece ser un CSV (content-type diferente)' }
    }

    return { valid: true }
  } catch (err) {
    return { valid: false, error: `No se pudo validar la URL: ${String(err)}` }
  }
}
