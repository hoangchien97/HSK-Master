/**
 * One-time script to backfill slugs for existing PortalAssignment records.
 * Run with: npx tsx scripts/backfill-assignment-slugs.ts
 */

import { PrismaClient } from '@prisma/client'
import { generateSlug } from '../utils/slug'

const prisma = new PrismaClient()

async function main() {
  const assignments = await prisma.portalAssignment.findMany({
    where: { slug: null },
    select: { id: true, title: true },
  })

  console.log(`Found ${assignments.length} assignments without slugs`)

  for (const assignment of assignments) {
    const baseSlug = generateSlug(assignment.title)
    let slug = baseSlug
    let suffix = 1

    // Ensure uniqueness
    while (await prisma.portalAssignment.findFirst({ where: { slug, id: { not: assignment.id } } })) {
      slug = `${baseSlug}-${suffix}`
      suffix++
    }

    await prisma.portalAssignment.update({
      where: { id: assignment.id },
      data: { slug },
    })

    console.log(`  ✅ ${assignment.title} → ${slug}`)
  }

  console.log('Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
