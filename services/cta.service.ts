import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export interface CtaStat {
  id: string
  value: number
  suffix?: string
  label: string
}

export const getCtaStats = unstable_cache(
  async (): Promise<CtaStat[]> => {
    try {
      const stats = await prisma.ctaStat.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      })

      return stats.map(stat => ({
        id: stat.id,
        value: stat.value,
        suffix: stat.suffix ?? undefined,
        label: stat.label,
      }))
    } catch (error) {
      console.error('Failed to fetch CTA stats:', error)
      return []
    }
  },
  ['cta-stats'],
  { revalidate: 3600, tags: ['cta'] }
)
