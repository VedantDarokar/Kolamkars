import { Navbar } from "@/components/navbar"
import { AnalyzeUpload } from "@/components/analyze-upload"

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Analyze Kolam Designs
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
            Upload your Kolam design to discover its mathematical properties, symmetry patterns, and cultural
            significance.
          </p>
        </div>

        <AnalyzeUpload />
      </div>
    </div>
  )
}
