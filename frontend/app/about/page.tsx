import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            About Kolam
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
            Discover the rich history, cultural significance, and mathematical beauty of this ancient South Indian art
            form.
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-16">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-8 text-foreground">
              Kolam is a traditional decorative art form from South India, particularly Tamil Nadu, where intricate
              geometric patterns are drawn on the ground using rice flour, chalk powder, or colored powders. These
              beautiful designs are created daily at the entrance of homes, temples, and public spaces as a symbol of
              welcome, prosperity, and spiritual protection.
            </p>
          </div>
        </section>

        {/* History and Origins */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">History and Origins</CardTitle>
              <CardDescription>The ancient roots of Kolam art</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ancient Beginnings</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The practice of Kolam dates back over 5,000 years, with references found in ancient Tamil literature
                    and inscriptions. Archaeological evidence suggests that similar geometric patterns were used in the
                    Indus Valley Civilization, indicating the deep historical roots of this art form.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Cultural Evolution</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Over centuries, Kolam evolved from simple protective symbols to complex artistic expressions. Each
                    region developed its own distinctive styles, patterns, and cultural interpretations, creating a rich
                    tapestry of geometric art across South India.
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-card-foreground">Traditional Materials</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Rice Flour", description: "Most common, represents prosperity" },
                    { name: "Chalk Powder", description: "For permanent designs" },
                    { name: "Colored Powders", description: "For festivals and celebrations" },
                    { name: "Flower Petals", description: "Natural, biodegradable option" },
                  ].map((material, index) => (
                    <div key={index} className="text-center">
                      <Badge variant="outline" className="mb-2">
                        {material.name}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{material.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cultural Significance */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Cultural Significance</CardTitle>
              <CardDescription>The deeper meaning behind the patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Welcome & Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    Kolam at the entrance invites prosperity while protecting the home from negative energies.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Daily Ritual</h3>
                  <p className="text-sm text-muted-foreground">
                    Drawing Kolam at dawn is a meditative practice that connects women to their cultural heritage.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Community Bond</h3>
                  <p className="text-sm text-muted-foreground">
                    Kolam competitions and collaborative designs strengthen community relationships and cultural
                    identity.
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-card-foreground">Spiritual Symbolism</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Dots (Pulli):</strong> Represent the universe and cosmic energy, serving as anchor points
                      for creation.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Lines:</strong> Symbolize the path of life, connecting different aspects of existence in
                      harmony.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Closed Loops:</strong> Represent the cycle of life, death, and rebirth in Hindu
                      philosophy.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Symmetry:</strong> Reflects the cosmic order and balance inherent in the universe.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Mathematical Principles */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Mathematical Beauty</CardTitle>
              <CardDescription>The science behind the art</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                Kolam designs demonstrate sophisticated mathematical concepts that have fascinated researchers and
                mathematicians worldwide. These patterns embody principles of geometry, topology, and algorithmic
                thinking that were intuitively understood by practitioners long before formal mathematical theory.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Geometric Concepts</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>Symmetry Groups:</strong> Rotational, reflectional, and translational symmetries
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>Tessellations:</strong> Patterns that tile the plane without gaps or overlaps
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>Fractals:</strong> Self-similar patterns at different scales
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>Graph Theory:</strong> Euler paths and circuits in dot-connecting patterns
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Algorithmic Thinking</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>Rule-based Construction:</strong> Systematic methods for pattern generation
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>Recursive Patterns:</strong> Designs that repeat at multiple levels
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>Optimization:</strong> Efficient paths that visit all dots exactly once
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        <strong>Constraint Satisfaction:</strong> Following rules while maximizing aesthetic appeal
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-card-foreground">Research Applications</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Modern researchers have found applications for Kolam principles in various fields:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <h4 className="font-medium mb-2">Computer Graphics</h4>
                    <p className="text-xs text-muted-foreground">Pattern generation algorithms</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <h4 className="font-medium mb-2">Network Design</h4>
                    <p className="text-xs text-muted-foreground">Optimal path planning</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <h4 className="font-medium mb-2">Art Education</h4>
                    <p className="text-xs text-muted-foreground">Teaching geometry through art</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Different Styles */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Regional Styles and Variations</CardTitle>
              <CardDescription>Diverse expressions across South India</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    region: "Tamil Nadu",
                    style: "Traditional Kolam",
                    characteristics: "Dot-based patterns, continuous lines, daily practice",
                    occasions: "Daily morning ritual, festivals",
                  },
                  {
                    region: "Andhra Pradesh",
                    style: "Muggulu",
                    characteristics: "Geometric patterns, rice flour, intricate designs",
                    occasions: "Festivals, special ceremonies",
                  },
                  {
                    region: "Karnataka",
                    style: "Rangoli",
                    characteristics: "Colorful powders, floral motifs, decorative borders",
                    occasions: "Diwali, weddings, celebrations",
                  },
                  {
                    region: "Kerala",
                    style: "Pookalam",
                    characteristics: "Flower petals, circular designs, natural materials",
                    occasions: "Onam festival, temple ceremonies",
                  },
                  {
                    region: "Odisha",
                    style: "Jhoti",
                    characteristics: "Rice paste, symbolic motifs, wall decorations",
                    occasions: "Religious festivals, harvest celebrations",
                  },
                  {
                    region: "West Bengal",
                    style: "Alpona",
                    characteristics: "Rice paste, curved lines, folk art elements",
                    occasions: "Durga Puja, Kali Puja, weddings",
                  },
                ].map((style, index) => (
                  <div key={index} className="bg-card rounded-lg p-4">
                    <h3 className="font-semibold text-card-foreground mb-2">{style.style}</h3>
                    <Badge variant="outline" className="mb-3">
                      {style.region}
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-3">{style.characteristics}</p>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Common Occasions:</span>
                      <p className="text-xs text-muted-foreground">{style.occasions}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Modern Revival */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Modern Revival and Digital Age</CardTitle>
              <CardDescription>Preserving tradition through technology</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                In the digital age, Kolam art is experiencing a renaissance through technology. Digital platforms,
                mobile apps, and online communities are helping preserve this ancient art form while making it
                accessible to new generations worldwide.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Digital Preservation</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Documentation of traditional patterns and techniques</li>
                    <li>• Video tutorials by master practitioners</li>
                    <li>• Digital archives of regional variations</li>
                    <li>• Interactive learning platforms</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Global Reach</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• International workshops and exhibitions</li>
                    <li>• Cross-cultural artistic collaborations</li>
                    <li>• Academic research and publications</li>
                    <li>• Integration with modern art and design</li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                <h3 className="text-lg font-semibold mb-3 text-primary">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Kolamkar's aims to bridge the gap between traditional knowledge and modern technology, providing tools
                  that help preserve, understand, and create Kolam designs while honoring their cultural significance
                  and mathematical beauty. Through digital innovation, we ensure this ancient art form continues to
                  inspire and educate future generations.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
