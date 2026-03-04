import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export interface Feature {
  id: string
  iconName: string
  title: string
  description: string
}

export const getFeatures = unstable_cache(
  async (): Promise<Feature[]> => {
    try {
      const features = await prisma.feature.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      })

      return features.map(feature => ({
        id: feature.id,
        iconName: feature.iconName,
        title: feature.title,
        description: feature.description,
      }))
    } catch (error) {
      console.error('Failed to fetch features:', error)
      return []
    }
  },
  ['features'],
  { revalidate: 3600, tags: ['features'] }
)
