'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Tipos para los datos de gear
export type GearInput = {
  name: string
  category: string
  subcategory?: string | null
  tier: string
  enhance?: number
  ap?: number
  dp?: number
  accuracy?: number
  evasion?: number
  critRate?: number
  priceG?: bigint | number | null
  source?: string | null
}

export type GearUpdateInput = Partial<GearInput>

// Tipo devuelto por getGearItems (del schema de Prisma)
export type GearItem = {
  id: string
  name: string
  category: string
  subcategory: string | null
  tier: string
  enhance: number
  ap: number
  dp: number
  accuracy: number
  evasion: number
  critRate: number
  priceG: bigint | null
  lastUpdated: Date
  source: string | null
}

/**
 * Obtiene todos los items de gear ordenados por nombre
 */
export async function getGearItems() {
  return prisma.gear.findMany({
    orderBy: { name: 'asc' }
  })
}

/**
 * Obtiene estadísticas agregadas del gear
 */
export async function getGearStats() {
  const items = await prisma.gear.findMany()

  return {
    totalAP: items.reduce((sum, i) => sum + i.ap, 0),
    totalDP: items.reduce((sum, i) => sum + i.dp, 0),
    totalAccuracy: items.reduce((sum, i) => sum + i.accuracy, 0),
    totalEvasion: items.reduce((sum, i) => sum + i.evasion, 0),
    totalCritRate: items.reduce((sum, i) => sum + i.critRate, 0),
    totalValue: items.reduce((sum, i) => sum + Number(i.priceG || 0), 0),
    count: items.length
  }
}

/**
 * Obtiene un item de gear por ID
 */
export async function getGearById(id: string) {
  return prisma.gear.findUnique({
    where: { id }
  })
}

/**
 * Crea un nuevo item de gear
 */
export async function createGear(data: GearInput) {
  const result = await prisma.gear.create({ data })
  revalidatePath('/')
  return result
}

/**
 * Actualiza un item de gear existente
 */
export async function updateGear(id: string, data: GearUpdateInput) {
  const result = await prisma.gear.update({
    where: { id },
    data: {
      ...data,
      lastUpdated: new Date()
    }
  })
  revalidatePath('/')
  return result
}

/**
 * Elimina un item de gear
 */
export async function deleteGear(id: string) {
  const result = await prisma.gear.delete({
    where: { id }
  })
  revalidatePath('/')
  return result
}

/**
 * Obtiene gear por categoría
 */
export async function getGearByCategory(category: string) {
  return prisma.gear.findMany({
    where: { category },
    orderBy: { name: 'asc' }
  })
}

/**
 * Obtiene gear por tier
 */
export async function getGearByTier(tier: string) {
  return prisma.gear.findMany({
    where: { tier },
    orderBy: { name: 'asc' }
  })
}
