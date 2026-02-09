import { getActiveAlbums } from "@/services"
import { GallerySectionClient } from "./GallerySectionClient"

export async function GallerySection() {
  const albums = await getActiveAlbums()

  return <GallerySectionClient albums={albums} />
}
