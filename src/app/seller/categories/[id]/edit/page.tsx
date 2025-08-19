'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import BackButton from '@/components/ui/back-button'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import ImageUpload from '@/components/ui/image-upload'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  parent?: {
    id: string
    name: string
  }
  _count: {
    products: number
    children: number
  }
}

interface FormData {
  name: string
  slug: string
  description: string
  image: string
  parentId: string
}

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [category, setCategory] = useState<Category | null>(null)
  const [parentCategories, setParentCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
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
      fetchCategory()
      fetchParentCategories()
    }
  }, [status, params.id])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${params.id}`)
      if (response.ok) {
        const categoryData = await response.json()
        setCategory(categoryData)
        setFormData({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description || '',
          image: categoryData.image || '',
          parentId: categoryData.parentId || '',
        })
      } else {
        router.push('/seller/categories')
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      router.push('/seller/categories')
    }
  }

  const fetchParentCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        // Filter out current category and its descendants to prevent circular references
        const filteredCategories = data.categories.filter((cat: Category) => 
          cat.id !== params.id
        )
        setParentCategories(filteredCategories)
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
        parentId: formData.parentId || null
      }

      const response = await fetch(`/api/categories/${params.id}`, {
        method: 'PUT',
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
          setErrors({ general: error.error || 'Failed to update category' })
        }
      }
    } catch (error) {
      console.error('Error updating category:', error)
      setErrors({ general: 'Failed to update category' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!category) return

    const confirmMessage = category._count.products > 0 || category._count.children > 0
      ? `This category has ${category._count.products} products and ${category._count.children} subcategories. You must move or delete them first.`
      : 'Are you sure you want to delete this category? This action cannot be undone.'

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/categories/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/seller/categories')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleImageUpload = (files: FileList) => {
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

  if (status === 'loading' || !category) {
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
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <BackButton href="/seller/categories" label="Back to Categories" className="mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
                <p className="text-gray-600">Update category information</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Category
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Category Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{category._count.products}</div>
            <div className="text-sm text-gray-500">Products</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{category._count.children}</div>
            <div className="text-sm text-gray-500">Subcategories</div>
          </div>
        </div>

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
                Leave empty to make this a root category, or select a parent to make it a subcategory.
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Category
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