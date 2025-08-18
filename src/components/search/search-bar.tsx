'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchSuggestion {
  id: string
  name: string
  type: 'product' | 'category'
  slug: string
  image?: string
}

interface SearchBarProps {
  placeholder?: string
  showSuggestions?: boolean
  onSearch?: (query: string) => void
  className?: string
}

export default function SearchBar({ 
  placeholder = "Search products...", 
  showSuggestions = true,
  onSearch,
  className = ""
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches] = useState([
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'
  ])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('findora_recent_searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Fetch suggestions when query changes
    if (query.length > 1 && showSuggestions) {
      fetchSuggestions(query)
    } else {
      setSuggestions([])
    }
  }, [query, showSuggestions])

  useEffect(() => {
    // Handle click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`)
      
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    // Save to recent searches
    const updatedRecent = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5)
    
    setRecentSearches(updatedRecent)
    localStorage.setItem('findora_recent_searches', JSON.stringify(updatedRecent))

    // Close dropdown
    setShowDropdown(false)
    setSelectedIndex(-1)

    // Call onSearch callback or navigate
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = [...suggestions, ...popularSearches.map(s => ({ name: s, type: 'popular' as const }))]
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => prev < items.length - 1 ? prev + 1 : prev)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          const selectedItem = items[selectedIndex]
          if ('slug' in selectedItem) {
            // Navigate to specific item
            if (selectedItem.type === 'product') {
              router.push(`/products/${selectedItem.slug}`)
            } else if (selectedItem.type === 'category') {
              router.push(`/categories/${selectedItem.slug}`)
            }
          } else {
            // Popular search
            handleSearch(selectedItem.name)
          }
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setShowDropdown(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      router.push(`/products/${suggestion.slug}`)
    } else if (suggestion.type === 'category') {
      router.push(`/categories/${suggestion.slug}`)
    }
    setShowDropdown(false)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('findora_recent_searches')
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => handleSearch()}
            className="h-8"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Search Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Loading */}
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 ${
                    selectedIndex === index ? 'bg-blue-50' : ''
                  }`}
                >
                  {suggestion.image ? (
                    <img
                      src={suggestion.image}
                      alt={suggestion.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-900">{suggestion.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{suggestion.type}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={search}
                  onClick={() => handleSearch(search)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 ${
                    selectedIndex === suggestions.length + index ? 'bg-blue-50' : ''
                  }`}
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Popular Searches
              </div>
              {popularSearches.map((search, index) => (
                <button
                  key={search}
                  onClick={() => handleSearch(search)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 ${
                    selectedIndex === suggestions.length + recentSearches.length + index ? 'bg-blue-50' : ''
                  }`}
                >
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && suggestions.length === 0 && recentSearches.length === 0 && query.length > 1 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No suggestions found</p>
              <p className="text-xs">Try pressing Enter to search anyway</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}