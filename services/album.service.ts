import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { Album } from '@/types/components'

export const getActiveAlbums = unstable_cache(
  async (): Promise<Album[]> => {
    try {
      const albums = await prisma.album.findMany({
        where: {
          isActive: true,
        },
        include: {
          photos: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      })

      return albums
    } catch (error) {
      console.error('Failed to fetch albums:', error)
      return []
    }
  },
  ['active-albums'],
  { revalidate: 3600, tags: ['albums'] }
)

export async function getAlbumById(id: string): Promise<Album | null> {
  const album = await prisma.album.findUnique({
    where: {
      id,
    },
    include: {
      photos: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  return album
}
