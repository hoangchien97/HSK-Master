"use client"

import { useState } from "react"
import { Images, Eye } from "lucide-react"
import { LightboxGallery } from "./LightboxGallery"
import OptimizedImage from "@/app/components/common/OptimizedImage"

interface Photo {
  id: string
  url: string
  title: string | null
  description: string | null
  order: number
}

interface Album {
  id: string
  title: string
  description: string | null
  thumbnail: string
  photoCount: number
  photos: Photo[]
}

interface AlbumCardProps {
  album: Album
}

export function AlbumCard({ album }: AlbumCardProps) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const slides = album.photos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    title: photo.title || undefined,
    description: photo.description || undefined,
  }))

  const handleOpenLightbox = (photoIndex: number = 0) => {
    setIndex(photoIndex)
    setOpen(true)
  }

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-white dark:bg-surface-dark shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => handleOpenLightbox(0)}
      >
        {/* Thumbnail */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <OptimizedImage
            src={album.thumbnail}
            alt={album.title}
            fill
            className="transition-transform duration-500 ease-out group-hover:scale-110"
            objectFit="cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Photo Count Badge */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1 md:gap-2 shadow-lg">
            <Images className="w-3 h-3 md:w-4 md:h-4 text-primary-600" />
            <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
              {album.photoCount} ảnh
            </span>
          </div>

          {/* Title & Description Overlay - Hidden by default, visible on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 lg:p-6 transform transition-all duration-300 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-white mb-1 md:mb-2 drop-shadow-lg">
              {album.title}
            </h3>
            {album.description && (
              <p className="text-white/90 text-xs md:text-sm drop-shadow line-clamp-2">
                {album.description}
              </p>
            )}
          </div>

          {/* View Button - Visible on Hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none">
            <div className="bg-white dark:bg-gray-900 px-4 py-2 md:px-6 md:py-3 rounded-full shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-300">
              <span className="text-xs md:text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1.5 md:gap-2">
                <Eye className="w-4 h-4 md:w-5 md:h-5" />
                Xem album
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <LightboxGallery
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
      />
    </>
  )
}
