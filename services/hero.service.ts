import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export interface HeroSlide {
  id: string
  image: string
  badge: string
  badgeColor: string
  title: string
  description: string
  primaryCTA: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }
  overlayGradient: string
}

export const getHeroSlides = unstable_cache(
  async (): Promise<HeroSlide[]> => {
    try {
      const slides = await prisma.heroSlide.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      })

      return slides.map(slide => ({
        id: slide.id,
        image: slide.image,
        badge: slide.badge,
        badgeColor: slide.badgeColor,
        title: slide.title,
        description: slide.description,
        primaryCTA: {
          text: slide.primaryCtaText,
          href: slide.primaryCtaHref,
        },
        secondaryCTA: slide.secondaryCtaText && slide.secondaryCtaHref
          ? {
              text: slide.secondaryCtaText,
              href: slide.secondaryCtaHref,
            }
          : undefined,
        overlayGradient: slide.overlayGradient,
      }))
    } catch (error) {
      console.error('Failed to fetch hero slides:', error)
      return []
    }
  },
  ['hero-slides'],
  { revalidate: 3600, tags: ['hero'] }
)
