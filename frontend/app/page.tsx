import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-card to-background py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground sm:text-6xl text-balance">
              Discover the Beauty of <span className="text-primary">Kolam Designs</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground text-pretty">
              Generate, analyze, and explore traditional South Indian geometric art with modern digital tools. Create
              stunning Kolam patterns and understand their mathematical beauty.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="font-semibold">
                <Link href="/generate">Generate Kolam</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-semibold bg-transparent">
                <Link href="/analyze">Analyze Design</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Kolam Designs */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">
              Featured Kolam Patterns
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Explore the intricate beauty and mathematical precision of traditional designs
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Lotus Kolam",
                description: "A sacred pattern representing purity and divine beauty",
                complexity: "Intermediate",
                symmetry: "8-fold rotational",
              },
              {
                title: "Geometric Grid",
                description: "Mathematical precision in traditional dot-based patterns",
                complexity: "Advanced",
                symmetry: "4-fold rotational",
              },
              {
                title: "Floral Mandala",
                description: "Nature-inspired circular design with intricate details",
                complexity: "Beginner",
                symmetry: "Radial symmetry",
              },
            ].map((design, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-square bg-card rounded-lg mb-4 flex items-center justify-center">
                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-serif">{design.title}</CardTitle>
                  <CardDescription>{design.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Complexity:</span>
                      <span className="font-medium">{design.complexity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Symmetry:</span>
                      <span className="font-medium">{design.symmetry}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Significance */}
      <section className="bg-card py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <h2 className="text-3xl font-serif font-bold tracking-tight text-card-foreground sm:text-4xl">
                Cultural Heritage
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Kolam is a traditional art form from South India, created using rice flour or chalk powder. These
                intricate geometric patterns are drawn at the entrance of homes as a symbol of welcome, prosperity, and
                protection.
              </p>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Each design carries deep cultural meaning and represents the harmony between mathematical precision and
                artistic expression, passed down through generations of women.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold tracking-tight text-card-foreground sm:text-4xl">
                Mathematical Beauty
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Kolam patterns demonstrate sophisticated mathematical concepts including symmetry, fractals, and
                algorithmic thinking. The dot-grid system creates endless possibilities for geometric exploration.
              </p>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Our digital tools help you understand these mathematical principles while creating and analyzing your
                own unique designs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
