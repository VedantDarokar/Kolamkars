"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface KolamDesign {
  id: string
  title: string
  creator: string
  createdAt: string
  complexity: string
  symmetryType: string
  gridType: string
  style: string
  likes: number
  views: number
  description: string
  parameters: {
    rows: number
    columns: number
    dotSpacing: number
    strokeType: string
    iterations: number
  }
}

// Mock data for gallery
const mockDesigns: KolamDesign[] = [
  {
    id: "1",
    title: "Sacred Lotus Mandala",
    creator: "Priya Sharma",
    createdAt: "2024-01-15",
    complexity: "Advanced",
    symmetryType: "8-fold",
    gridType: "Circular",
    style: "Traditional",
    likes: 124,
    views: 856,
    description:
      "A traditional lotus-inspired design representing purity and divine beauty, perfect for festival celebrations.",
    parameters: { rows: 12, columns: 12, dotSpacing: 25, strokeType: "continuous", iterations: 2 },
  },
  {
    id: "2",
    title: "Geometric Harmony",
    creator: "Arjun Patel",
    createdAt: "2024-01-14",
    complexity: "Intermediate",
    symmetryType: "4-fold",
    gridType: "Square",
    style: "Modern",
    likes: 89,
    views: 432,
    description:
      "A contemporary take on traditional patterns, blending mathematical precision with artistic expression.",
    parameters: { rows: 8, columns: 8, dotSpacing: 30, strokeType: "thick", iterations: 1 },
  },
  {
    id: "3",
    title: "Festival Rangoli",
    creator: "Meera Krishnan",
    createdAt: "2024-01-13",
    complexity: "Beginner",
    symmetryType: "Radial",
    gridType: "Circular",
    style: "Traditional",
    likes: 67,
    views: 298,
    description: "Simple yet elegant design perfect for beginners, traditionally drawn during Diwali celebrations.",
    parameters: { rows: 6, columns: 6, dotSpacing: 35, strokeType: "continuous", iterations: 1 },
  },
  {
    id: "4",
    title: "Minimalist Flow",
    creator: "Raj Kumar",
    createdAt: "2024-01-12",
    complexity: "Intermediate",
    symmetryType: "Bilateral",
    gridType: "Square",
    style: "Minimalist",
    likes: 156,
    views: 723,
    description: "Clean lines and simple forms create a modern interpretation of classical Kolam principles.",
    parameters: { rows: 10, columns: 6, dotSpacing: 20, strokeType: "dashed", iterations: 1 },
  },
  {
    id: "5",
    title: "Cosmic Spiral",
    creator: "Lakshmi Devi",
    createdAt: "2024-01-11",
    complexity: "Advanced",
    symmetryType: "6-fold",
    gridType: "Hexagonal",
    style: "Fusion",
    likes: 203,
    views: 1247,
    description: "An intricate spiral pattern representing the cosmic dance of creation and destruction.",
    parameters: { rows: 14, columns: 14, dotSpacing: 22, strokeType: "continuous", iterations: 3 },
  },
  {
    id: "6",
    title: "Morning Blessing",
    creator: "Sunita Reddy",
    createdAt: "2024-01-10",
    complexity: "Beginner",
    symmetryType: "4-fold",
    gridType: "Square",
    style: "Traditional",
    likes: 45,
    views: 189,
    description: "A simple daily Kolam design traditionally drawn at sunrise to welcome prosperity.",
    parameters: { rows: 5, columns: 5, dotSpacing: 40, strokeType: "continuous", iterations: 1 },
  },
]

export function GalleryGrid() {
  const [selectedDesign, setSelectedDesign] = useState<KolamDesign | null>(null)

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDesigns.map((design) => (
          <Dialog key={design.id}>
            <DialogTrigger asChild>
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardContent className="p-0">
                  {/* Design Preview */}
                  <div className="aspect-square bg-card rounded-t-lg p-6 flex items-center justify-center">
                    <div className="w-full h-full bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-24 h-24 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={0.5}
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Design Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-serif font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {design.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">by {design.creator}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={getComplexityColor(design.complexity)}>{design.complexity}</Badge>
                      <Badge variant="outline">{design.symmetryType}</Badge>
                      <Badge variant="outline">{design.style}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          {design.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {design.views}
                        </span>
                      </div>
                      <span>{new Date(design.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">{design.title}</DialogTitle>
                <DialogDescription>
                  Created by {design.creator} on {new Date(design.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Design Preview */}
                <div className="aspect-square bg-card rounded-lg p-8 flex items-center justify-center">
                  <div className="w-full h-full bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-48 h-48 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={0.3}
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Design Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{design.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Properties</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Complexity:</span>
                        <Badge className={getComplexityColor(design.complexity)}>{design.complexity}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Symmetry:</span>
                        <span>{design.symmetryType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Grid Type:</span>
                        <span>{design.gridType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Style:</span>
                        <span>{design.style}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Parameters</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Grid Size:</span>
                        <span>
                          {design.parameters.rows} × {design.parameters.columns}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dot Spacing:</span>
                        <span>{design.parameters.dotSpacing}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stroke Type:</span>
                        <span className="capitalize">{design.parameters.strokeType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Iterations:</span>
                        <span>{design.parameters.iterations}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button className="flex-1">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Recreate
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      Like ({design.likes})
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-12">
        <Button variant="outline" size="lg">
          Load More Designs
        </Button>
      </div>
    </>
  )
}
