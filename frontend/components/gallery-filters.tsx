"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export function GalleryFilters() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const filterCategories = {
    complexity: ["Beginner", "Intermediate", "Advanced"],
    symmetry: ["2-fold", "4-fold", "6-fold", "8-fold", "Radial", "Bilateral"],
    gridType: ["Square", "Triangular", "Hexagonal", "Circular"],
    style: ["Traditional", "Modern", "Fusion", "Minimalist"],
  }

  const addFilter = (category: string, value: string) => {
    const filterKey = `${category}:${value}`
    if (!selectedFilters.includes(filterKey)) {
      setSelectedFilters([...selectedFilters, filterKey])
    }
  }

  const removeFilter = (filterKey: string) => {
    setSelectedFilters(selectedFilters.filter((f) => f !== filterKey))
  }

  const clearAllFilters = () => {
    setSelectedFilters([])
    setSearchTerm("")
  }

  return (
    <div className="mb-8 space-y-6">
      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search designs by name, creator, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button variant="outline" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(filterCategories).map(([category, options]) => (
          <Select key={category} onValueChange={(value) => addFilter(category, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`${category.charAt(0).toUpperCase() + category.slice(1)}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground self-center">Active filters:</span>
          {selectedFilters.map((filter) => {
            const [category, value] = filter.split(":")
            return (
              <Badge key={filter} variant="secondary" className="cursor-pointer" onClick={() => removeFilter(filter)}>
                {category}: {value}
                <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
