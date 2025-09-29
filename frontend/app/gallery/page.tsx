import { Navbar } from "@/components/navbar"
import { GalleryGrid } from "@/components/gallery-grid"
import { GalleryFilters } from "@/components/gallery-filters"

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Kolam Gallery
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
            Explore beautiful Kolam designs created by our community. Discover patterns, learn techniques, and find
            inspiration for your own creations.
          </p>
        </div>

        <GalleryFilters />
        <GalleryGrid />
      </div>
    </div>
  )
}
