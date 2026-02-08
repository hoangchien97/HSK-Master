import { prisma } from '@/app/lib/prisma'

export interface CtaStat {
  id: string
  value: number
  suffix?: string
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
      suffix: stat.suffix ?? undefined,
      label: stat.label,
    }))
  } catch (error) {
    console.error('Failed to fetch CTA stats:', error)
    return []
  }
}
