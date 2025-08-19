'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PriceRangeSlider from './price-range-slider'
import RatingFilter from './rating-filter'
import SellerFilter from './seller-filter'
import AvailabilityFilter from './availability-filter'
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Search,
  Tag,
  MapPin
} from 'lucide-react'

export interface FilterState {
  priceRange: [number, number]
  categories: string[]
  rating: number
  sellerTypes: string[]
  availability: string[]
  tags: string[]
  location: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  searchQuery: string
}

interface AdvancedFilterPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  categories: { id: string; name: string; count?: number }[]
  priceRange: { min: number; max: number }
  isLoading?: boolean
  className?: string
  showMobileToggle?: boolean
}

interface FilterSection {
  id: string
  title: string
  component: React.ReactNode
  defaultOpen: boolean
}

export default function AdvancedFilterPanel({
  filters,
  onFiltersChange,
  categories,
  priceRange,
  isLoading = false,
  className = "",
  showMobileToggle = true
}: AdvancedFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    categories: true,
    rating: true,
    seller: false,
    availability: false,
    tags: false,
    location: false
  })

  // Track filter count for display
  const activeFilterCount = [
    filters.priceRange[0] > priceRange.min || filters.priceRange[1] < priceRange.max ? 1 : 0,
    filters.categories.length,
    filters.rating > 0 ? 1 : 0,
    filters.sellerTypes.length,
    filters.availability.length,
    filters.tags.length,
    filters.location ? 1 : 0
  ].reduce((sum, count) => sum + count, 0)

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: [priceRange.min, priceRange.max],
      categories: [],
      rating: 0,
      sellerTypes: [],
      availability: [],
      tags: [],
      location: '',
      sortBy: 'relevance',
      sortOrder: 'desc',
      searchQuery: filters.searchQuery // Keep search query
    })
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId]
    updateFilters({ categories: newCategories })
  }

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !filters.tags.includes(tag.trim())) {
      updateFilters({ tags: [...filters.tags, tag.trim()] })
    }
  }

  const handleTagRemove = (tag: string) => {
    updateFilters({ tags: filters.tags.filter(t => t !== tag) })
  }

  const filterSections: FilterSection[] = [
    {
      id: 'price',
      title: 'Price Range',
      defaultOpen: true,
      component: (
        <PriceRangeSlider
          min={priceRange.min}
          max={priceRange.max}
          value={filters.priceRange}
          onValueChange={(value) => updateFilters({ priceRange: value })}
          formatValue={(val) => `$${val}`}
        />
      )
    },
    {
      id: 'categories',
      title: 'Categories',
      defaultOpen: true,
      component: (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.categories.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
              />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm text-gray-900">{category.name}</span>
                {category.count !== undefined && (
                  <span className="text-xs text-gray-500">({category.count})</span>
                )}
              </div>
            </label>
          ))}
        </div>
      )
    },
    {
      id: 'rating',
      title: 'Customer Rating',
      defaultOpen: true,
      component: (
        <RatingFilter
          value={filters.rating}
          onValueChange={(rating) => updateFilters({ rating })}
          showCounts={true}
        />
      )
    },
    {
      id: 'seller',
      title: 'Seller Type',
      defaultOpen: false,
      component: (
        <SellerFilter
          value={filters.sellerTypes}
          onValueChange={(sellerTypes) => updateFilters({ sellerTypes })}
          showCounts={true}
        />
      )
    },
    {
      id: 'availability',
      title: 'Availability',
      defaultOpen: false,
      component: (
        <AvailabilityFilter
          value={filters.availability}
          onValueChange={(availability) => updateFilters({ availability })}
          showCounts={true}
        />
      )
    },
    {
      id: 'tags',
      title: 'Tags',
      defaultOpen: false,
      component: (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              placeholder="Add tag..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleTagAdd(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }}
              className="text-sm"
            />
          </div>
          {filters.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'location',
      title: 'Location',
      defaultOpen: false,
      component: (
        <div className="space-y-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Enter location..."
              value={filters.location}
              onChange={(e) => updateFilters({ location: e.target.value })}
              className="pl-10 text-sm"
            />
          </div>
          <div className="text-xs text-gray-500">
            Filter by seller or shipping location
          </div>
        </div>
      )
    }
  ]

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-600 hover:text-gray-900"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Sort Options */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Sort by</h4>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-')
            updateFilters({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' })
          }}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
        >
          <option value="relevance-desc">Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="rating-desc">Highest Rated</option>
          <option value="popularity-desc">Most Popular</option>
        </select>
      </div>

      {/* Filter Sections */}
      {filterSections.map((section) => (
        <div key={section.id} className="border-b border-gray-200 pb-4 last:border-b-0">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">{section.title}</h4>
            {expandedSections[section.id] ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {expandedSections[section.id] && (
            <div className="mt-3">
              {section.component}
            </div>
          )}
        </div>
      ))}

      {/* Apply Filters Button (Mobile) */}
      {showMobileToggle && (
        <div className="lg:hidden">
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Applying...' : `Apply Filters${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
          </Button>
        </div>
      )}
    </div>
  )

  if (showMobileToggle) {
    return (
      <>
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Desktop Sidebar */}
        <div className={`hidden lg:block ${className}`}>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <FilterContent />
          </div>
        </div>

        {/* Mobile Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 overflow-y-auto h-full pb-20">
                <FilterContent />
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className={className}>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <FilterContent />
      </div>
    </div>
  )
}