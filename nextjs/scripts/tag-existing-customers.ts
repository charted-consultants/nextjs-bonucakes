/**
 * Tag all existing customers as food takeaway customers
 * Run this once to tag existing customers in the database
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function tagExistingCustomers() {
  console.log('Tagging all existing customers as food takeaway customers...\n')

  try {
    // Get all customers
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        tags: true,
      },
    })

    console.log(`Found ${customers.length} customers\n`)

    let updated = 0
    let skipped = 0

    for (const customer of customers) {
      const currentTags = customer.tags || []

      // Check if customer already has the food_takeaway tag
      if (currentTags.includes('food_takeaway')) {
        console.log(`⊙ Skipped: ${customer.name} (${customer.email}) - already tagged`)
        skipped++
        continue
      }

      // Add food_takeaway tag
      const updatedTags = Array.from(new Set([...currentTags, 'food_takeaway']))

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          tags: updatedTags,
        },
      })

      console.log(`✅ Tagged: ${customer.name} (${customer.email})`)
      updated++
    }

    console.log(`\n=== Tagging Summary ===`)
    console.log(`Total customers: ${customers.length}`)
    console.log(`Tagged: ${updated}`)
    console.log(`Skipped (already tagged): ${skipped}`)
    console.log(`\n✅ All existing customers have been tagged as food takeaway customers!`)

  } catch (error) {
    console.error('Error tagging customers:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

tagExistingCustomers()
