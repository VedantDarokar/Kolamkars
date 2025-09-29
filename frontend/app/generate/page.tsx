import { Navbar } from "@/components/navbar"
import { GenerateWithInputs } from "@/components/generate-with-inputs"
import { GenerateFromImage } from "@/components/generate-from-image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Generate Kolam Designs
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
            Create beautiful Kolam patterns using our digital tools. Choose from parameter-based generation or upload
            your own sketch.
          </p>
        </div>

        <Tabs defaultValue="inputs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="inputs" className="text-base">
              Generate with Inputs
            </TabsTrigger>
            <TabsTrigger value="image" className="text-base">
              Generate from Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inputs" className="space-y-6">
            <GenerateWithInputs />
          </TabsContent>

          <TabsContent value="image" className="space-y-6">
            <GenerateFromImage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
