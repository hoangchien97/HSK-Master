import 'dotenv/config'
import { prisma } from '@/lib/prisma'

async function testConnection() {
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)

  try {
    console.log('Testing database connection...')

    const heroSlidesCount = await prisma.heroSlide.count()
    console.log(`✅ Found ${heroSlidesCount} hero slides`)

    const coursesCount = await prisma.course.count()
    console.log(`✅ Found ${coursesCount} courses`)

    const hskLevelsCount = await prisma.hSKLevel.count()
    console.log(`✅ Found ${hskLevelsCount} HSK levels`)

    const featuresCount = await prisma.feature.count()
    console.log(`✅ Found ${featuresCount} features`)

    console.log('\n✅ All database tables accessible!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Connection failed:', error)
    process.exit(1)
  }
}

testConnection()
