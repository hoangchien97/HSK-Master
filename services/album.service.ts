import { prisma } from '@/lib/prisma'
import { Album } from '@/types/components'

export async function getActiveAlbums(): Promise<Album[]> {
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
}

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
