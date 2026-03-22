import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const seedItems = [
  {
    name: 'Kzarka Kamasylve Sword',
    category: 'Weapon',
    subcategory: 'Main Weapon',
    tier: 'PEN',
    enhance: 25,
    ap: 432,
    dp: 0,
    accuracy: 12,
    evasion: 0,
    critRate: 11,
    priceG: BigInt('8500000000000'), // ~8.5 trillion silver
    source: 'manual'
  },
  {
    name: 'Griffon Helm',
    category: 'Armor',
    subcategory: 'Helmet',
    tier: 'TRI',
    enhance: 15,
    ap: 0,
    dp: 128,
    accuracy: 0,
    evasion: 8,
    critRate: 0,
    priceG: BigInt('250000000000'), // ~250 billion
    source: 'manual'
  },
  {
    name: 'Odylic Ring',
    category: 'Accessory',
    subcategory: 'Ring',
    tier: 'DUO',
    enhance: 10,
    ap: 15,
    dp: 0,
    accuracy: 0,
    evasion: 0,
    critRate: 5,
    priceG: BigInt('85000000000'), // ~85 billion
    source: 'manual'
  },
  {
    name: 'Dandelion Black_Sword',
    category: 'Weapon',
    subcategory: 'Main Weapon',
    tier: 'PEN',
    enhance: 24,
    ap: 438,
    dp: 0,
    accuracy: 14,
    evasion: 0,
    critRate: 10,
    priceG: BigInt('12000000000000'), // ~12 trillion
    source: 'sheets'
  },
  {
    name: 'Urugon Shoes',
    category: 'Armor',
    subcategory: 'Shoes',
    tier: 'PRI',
    enhance: 12,
    ap: 0,
    dp: 95,
    accuracy: 0,
    evasion: 10,
    critRate: 0,
    priceG: BigInt('45000000000'), // ~45 billion
    source: 'manual'
  }
]

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.gear.deleteMany()
  console.log('✓ Cleared existing gear items')

  // Insert seed data
  for (const item of seedItems) {
    await prisma.gear.create({ data: item })
    console.log(`✓ Created: ${item.name}`)
  }

  console.log(`\n✅ Seed complete: ${seedItems.length} items created`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
