"use client"

import { Camera } from "lucide-react"
import { AlbumCard } from "./AlbumCard"
import SectionHeader from '@/app/components/landing/shared/SectionHeader';

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

interface GallerySectionClientProps {
  albums: Album[]
}

export function GallerySectionClient({ albums }: GallerySectionClientProps) {
  return (
    <section className="py-8 md:py-12 lg:py-16 xl:py-20 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-7xl">
        <SectionHeader
          icon={<Camera />}
          tag="Kỷ niệm lớp học"
          title="Album Ảnh Lớp Học"
          description="Những khoảnh khắc đáng nhớ trong hành trình học tiếng Trung cùng cô Ngọc và các bạn học viên"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mt-6 md:mt-8 lg:mt-12">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>

        {albums.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
              Chưa có album nào được tạo
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
