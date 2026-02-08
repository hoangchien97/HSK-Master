import { prisma } from '@/app/lib/prisma'

export interface Feature {
  id: string
  icon: string
  iconBg: string
  iconColor: string
  title: string
  description: string
}

export async function getFeatures(): Promise<Feature[]> {
  try {
    const features = await prisma.feature.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    return features.map(feature => ({
      id: feature.id,
      icon: feature.icon,
      iconBg: feature.iconBg,
      iconColor: feature.iconColor,
      title: feature.title,
      description: feature.description,
    }))
  } catch (error) {
    console.error('Failed to fetch features:', error)
    return []
  }
}
