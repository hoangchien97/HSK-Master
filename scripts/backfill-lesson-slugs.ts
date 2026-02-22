/**
 * Backfill slugs for existing Lesson records.
 * Run with: npx tsx scripts/backfill-lesson-slugs.ts
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { generateSlug } from '@/utils/slug'

const prisma = new PrismaClient()

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: { slug: null },
    select: { id: true, title: true },
  })

  console.log(`Found ${lessons.length} lessons without slugs`)

  for (const lesson of lessons) {
    const baseSlug = generateSlug(lesson.title)
    let slug = baseSlug
    let suffix = 1

    // Ensure uniqueness
    while (true) {
      const existing = await prisma.lesson.findFirst({
        where: { slug, id: { not: lesson.id } },
      })
      if (!existing) break
      slug = `${baseSlug}-${suffix}`
      suffix++
    }

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { slug },
    })
    console.log(`  ✅ ${lesson.title} → ${slug}`)
  }

  console.log('Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
