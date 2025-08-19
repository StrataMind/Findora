'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import ImageUpload from '@/components/ui/image-upload'
import BackButton from '@/components/ui/back-button'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
}

interface FormData {
  name: string
  slug: string
  description: string
  image: string
  parentId: string
}

export default function CreateCategoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [parentCategories, setParentCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === 'authenticated') {
      fetchParentCategories()
    }
  }, [status])

  const fetchParentCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setParentCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching parent categories:', error)
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === generateSlug(prev.name) || prev.slug === '' 
        ? generateSlug(name) 
        : prev.slug
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const submitData = {
        ...formData,
        parentId: formData.parentId || undefined
      }

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        router.push('/seller/categories')
      } else {
        const error = await response.json()
        if (error.details) {
          const newErrors: Record<string, string> = {}
          error.details.forEach((detail: any) => {
            newErrors[detail.path[0]] = detail.message
          })
          setErrors(newErrors)
        } else {
          setErrors({ general: error.error || 'Failed to create category' })
        }
      }
    } catch (error) {
      console.error('Error creating category:', error)
      setErrors({ general: 'Failed to create category' })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (files: FileList) => {
    // In a real implementation, you'd upload to a storage service
    // For now, we'll just use a placeholder URL
    if (files.length > 0) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <BackButton href="/seller/categories" label="Back to Categories" className="mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Category</h1>
              <p className="text-gray-600">Add a new category to organize your products</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{errors.general}</p>
              </div>
            )}

            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Electronics, Clothing, Books"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Category Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Slug *
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g., electronics, clothing, books"
                className={errors.slug ? 'border-red-500' : ''}
              />
              <p className="text-gray-500 text-xs mt-1">
                Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
              </p>
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
              )}
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">None (Root Category)</option>
                {parentCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-gray-500 text-xs mt-1">
                Leave empty to create a root category, or select a parent to create a subcategory.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what products belong in this category..."
                rows={4}
              />
            </div>

            {/* Category Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              <ImageUpload
                onFilesSelected={handleImageUpload}
                maxFiles={1}
                accept="image/*"
              />
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Category preview"
                    className="h-32 w-32 object-cover rounded-lg"
                  />
                </div>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Optional. Upload an image to represent this category.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Link href="/seller/categories">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Category
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}