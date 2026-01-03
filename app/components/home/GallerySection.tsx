import { getActiveAlbums } from "@/app/services"
import { GallerySectionClient } from "./GallerySectionClient"

export async function GallerySection() {
  const albums = await getActiveAlbums()
  console.log(albums[0].photos)

  return <GallerySectionClient albums={albums} />
}
