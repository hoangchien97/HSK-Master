import { prisma } from '@/lib/prisma'

export interface CtaStat {
  id: string
  value: string
  label: string
}

export async function getCtaStats(): Promise<CtaStat[]> {
  try {
    const stats = await prisma.ctaStat.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    return stats.map(stat => ({
      id: stat.id,
      value: stat.value,
      label: stat.label,
    }))
  } catch (error) {
    console.error('Failed to fetch CTA stats:', error)
    return []
  }
}
