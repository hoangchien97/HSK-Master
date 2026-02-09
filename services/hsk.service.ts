import { prisma } from '@/lib/prisma'

export interface HSKLevel {
  level: number
  title: string
  badge: string
  badgeColor: string
  description: string
  vocabularyCount: string
  targetAudience: string
  targetIcon: string
  accentColor: string
  bgGradient: string
  href: string
}

export async function getHSKLevels(): Promise<HSKLevel[]> {
  try {
    const levels = await prisma.hSKLevel.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    return levels.map(level => ({
      level: level.level,
      title: level.title,
      badge: level.badge,
      badgeColor: level.badgeColor,
      description: level.description,
      vocabularyCount: level.vocabularyCount,
      targetAudience: level.targetAudience,
      targetIcon: level.targetIcon,
      accentColor: level.accentColor,
      bgGradient: level.bgGradient,
      href: level.href,
    }))
  } catch (error) {
    console.error('Failed to fetch HSK levels:', error)
    return []
  }
}

export async function getHSKLevelByLevel(level: number): Promise<HSKLevel | null> {
  try {
    const hskLevel = await prisma.hSKLevel.findFirst({
      where: {
        level,
        isActive: true
      },
    })

    if (!hskLevel) return null

    return {
      level: hskLevel.level,
      title: hskLevel.title,
      badge: hskLevel.badge,
      badgeColor: hskLevel.badgeColor,
      description: hskLevel.description,
      vocabularyCount: hskLevel.vocabularyCount,
      targetAudience: hskLevel.targetAudience,
      targetIcon: hskLevel.targetIcon,
      accentColor: hskLevel.accentColor,
      bgGradient: hskLevel.bgGradient,
      href: hskLevel.href,
    }
  } catch (error) {
    console.error(`Failed to fetch HSK level ${level}:`, error)
    return null
  }
}
