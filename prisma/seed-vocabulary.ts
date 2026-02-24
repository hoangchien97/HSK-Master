import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

/**
 * Seed HSK 1-6 vocabulary data from JSON exports for practice feature.
 * Reads from prisma/hsk_vocab_exports/vocabulary_hsk{1-6}.json
 * Maps JSON lesson_number → lesson order in DB.
 *
 * After seeding vocabulary, updates Course.lessonCount and Course.vocabularyCount
 * from actual DB counts so that the UI displays correct values.
 *
 * Run standalone: npx tsx prisma/seed-vocabulary.ts
 * Also called from main seed.ts via seedVocabulary()
 */

/** JSON vocab entry structure from hsk_vocab_exports (meta removed, id removed) */
interface VocabExportEntry {
  hsk_level_code: string
  lesson_number: number
  chinese_word: string
  pinyin: string
  meaning: string
  meaning_vi: string | null
  example_sentence: string | null
  example_pinyin: string | null
  example_meaning: string | null
  word_type: string | null
  display_order: number
}

/** HSK level config */
const HSK_LEVELS = [
  { level: 1, slug: "hsk-1", file: "vocabulary_hsk1.json" },
  { level: 2, slug: "hsk-2", file: "vocabulary_hsk2.json" },
  { level: 3, slug: "hsk-3", file: "vocabulary_hsk3.json" },
  { level: 4, slug: "hsk-4", file: "vocabulary_hsk4.json" },
  { level: 5, slug: "hsk-5", file: "vocabulary_hsk5.json" },
  { level: 6, slug: "hsk-6", file: "vocabulary_hsk6.json" },
]

/**
 * Main seed function — exported so seed.ts can call it directly.
 */
export async function seedVocabulary() {
  console.log("🌱 Seeding HSK vocabulary data for ALL levels (1-6)...")
  console.log("📂 Reading from prisma/hsk_vocab_exports/\n")

  const exportDir = path.join(__dirname, "hsk_vocab_exports")
  let totalCreated = 0
  let totalSkipped = 0

  for (const hsk of HSK_LEVELS) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📚 Processing ${hsk.slug.toUpperCase()}...`)

    // 1. Find the course with lessons
    const course = await prisma.course.findFirst({
      where: { slug: hsk.slug },
      include: { lessons: { orderBy: { order: "asc" } } },
    })

    if (!course) {
      console.log(`  ⚠️  Course ${hsk.slug} not found, skipping`)
      continue
    }

    // 2. Build lesson order → ID map
    const lessonOrderMap: Record<number, string> = {}
    for (const lesson of course.lessons) {
      lessonOrderMap[lesson.order] = lesson.id
    }
    console.log(`  📖 Found ${course.lessons.length} lessons in DB`)

    // 3. Read JSON export file
    const jsonPath = path.join(exportDir, hsk.file)
    if (!fs.existsSync(jsonPath)) {
      console.log(`  ⚠️  File ${hsk.file} not found, skipping`)
      continue
    }

    const vocabData: VocabExportEntry[] = JSON.parse(
      fs.readFileSync(jsonPath, "utf-8")
    )
    console.log(`  📄 Loaded ${vocabData.length} words from JSON`)

    // 4. Clear existing vocabulary for ALL lessons of this course
    const lessonIds = course.lessons.map((l) => l.id)
    const deleted = await prisma.vocabulary.deleteMany({
      where: { lessonId: { in: lessonIds } },
    })
    if (deleted.count > 0) {
      console.log(`  🗑️  Cleared ${deleted.count} existing vocabulary entries`)
    }

    // 5. Group vocab by lesson_number
    const vocabByLesson = new Map<number, VocabExportEntry[]>()
    for (const entry of vocabData) {
      const existing = vocabByLesson.get(entry.lesson_number) || []
      existing.push(entry)
      vocabByLesson.set(entry.lesson_number, existing)
    }

    // 6. Create vocabulary records, mapping lesson_number → lesson order
    let levelCreated = 0
    const skippedLessons: number[] = []

    for (const [lessonNumber, entries] of vocabByLesson) {
      const lessonId = lessonOrderMap[lessonNumber]

      if (!lessonId) {
        skippedLessons.push(lessonNumber)
        totalSkipped += entries.length
        continue
      }

      const vocabRecords = entries
        .sort((a, b) => a.display_order - b.display_order)
        .map((entry) => ({
          lessonId,
          word: entry.chinese_word,
          pinyin: entry.pinyin,
          meaning: entry.meaning,
          meaningVi: entry.meaning_vi || null,
          wordType: entry.word_type,
          displayOrder: entry.display_order,
          exampleSentence: entry.example_sentence,
          examplePinyin: entry.example_pinyin,
          exampleMeaning: entry.example_meaning,
        }))

      await prisma.vocabulary.createMany({ data: vocabRecords })
      levelCreated += vocabRecords.length
    }

    // 7. Update course vocabularyCount AND lessonCount from actual DB counts
    const actualVocabCount = await prisma.vocabulary.count({
      where: { lessonId: { in: lessonIds } },
    })
    const actualLessonCount = await prisma.lesson.count({
      where: {
        courseId: course.id,
        vocabularies: { some: {} }, // only lessons that have at least 1 vocabulary
      },
    })
    await prisma.course.update({
      where: { id: course.id },
      data: {
        vocabularyCount: actualVocabCount,
        lessonCount: actualLessonCount,
      },
    })

    totalCreated += levelCreated
    console.log(`  ✅ Created ${levelCreated} vocabulary entries`)
    if (skippedLessons.length > 0) {
      console.log(
        `  ⚠️  Skipped JSON lessons [${skippedLessons.join(", ")}] (no matching lesson order in DB)`
      )
    }
    console.log(`  📊 Course: vocabularyCount → ${actualVocabCount}, lessonCount → ${actualLessonCount}`)
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`🎉 DONE! Created ${totalCreated} vocabulary entries across all HSK levels`)
  if (totalSkipped > 0) {
    console.log(`⚠️  ${totalSkipped} entries skipped (no matching lesson)`)
  }
}

/* ───────── Standalone execution ───────── */
const isMainModule = require.main === module || process.argv[1]?.includes("seed-vocabulary")

if (isMainModule) {
  seedVocabulary()
    .catch((e) => {
      console.error("❌ Seed error:", e)
      process.exit(1)
    })
    .finally(() => prisma.$disconnect())
}
