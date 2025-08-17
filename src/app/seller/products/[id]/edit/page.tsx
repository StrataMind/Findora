'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ImageUpload from '@/components/ui/image-upload'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  compareAtPrice: z.coerce.number().min(0).optional(),
  sku: z.string().optional(),
  inventory: z.coerce.number().int().min(0, 'Inventory cannot be negative'),
  weight: z.coerce.number().min(0).optional(),
  dimensions: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.string().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : []),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']),
  featured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface Product {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  sku?: string
  inventory: number
  weight?: number
  dimensions?: string
  slug: string
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  featured: boolean
  categoryId?: string
  tags: string[]
  metaTitle?: string
  metaDescription?: string
  images: { id: string; url: string; altText?: string; position: number }[]
  category?: { id: string; name: string; slug: string }
  createdAt: string
  updatedAt: string
}

interface ImageFile {
  id: string
  file?: File
  preview?: string
  uploading?: boolean
  uploaded?: boolean
  url: string
  altText?: string
}

const productCategories = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'fashion', name: 'Fashion & Clothing' },
  { id: 'home', name: 'Home & Garden' },
  { id: 'health', name: 'Health & Beauty' },
  { id: 'sports', name: 'Sports & Outdoors' },
  { id: 'books', name: 'Books & Media' },
  { id: 'toys', name: 'Toys & Games' },
  { id: 'automotive', name: 'Automotive' },
  { id: 'food', name: 'Food & Beverages' },
  { id: 'art', name: 'Art & Crafts' },
]

export default function EditProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [error, setError] = useState('')
  const [images, setImages] = useState<ImageFile[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  const watchedStatus = watch('status')

  useEffect(() => {
    if (status === 'authenticated' && productId) {
      fetchProduct()
    }
  }, [status, productId])

  const fetchProduct = async () => {
    try {
      setIsLoadingProduct(true)
      const response = await fetch(`/api/products/${productId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Product not found')
        } else {
          setError('Failed to load product')
        }
        return
      }

      const data = await response.json()
      const productData = data.product

      setProduct(productData)
      
      // Reset form with product data
      reset({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        compareAtPrice: productData.compareAtPrice || '',
        sku: productData.sku || '',
        inventory: productData.inventory,
        weight: productData.weight || '',
        dimensions: productData.dimensions || '',
        categoryId: productData.categoryId || '',
        tags: productData.tags.join(', '),
        status: productData.status,
        featured: productData.featured,
        metaTitle: productData.metaTitle || '',
        metaDescription: productData.metaDescription || '',
      })

      // Set existing images
      const existingImages: ImageFile[] = productData.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        uploaded: true
      }))
      setImages(existingImages)

    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Failed to load product')
    } finally {
      setIsLoadingProduct(false)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    setError('')

    try {
      // Prepare product data with images
      const productData = {
        ...data,
        images: images.filter(img => img.uploaded).map((img, index) => ({
          url: img.url,
          altText: img.altText || `${data.name} - Image ${index + 1}`,
          position: index
        }))
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        router.push('/seller/products')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update product')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('Product update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProduct = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/seller/products')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete product')
      }
    } catch (error) {
      setError('Failed to delete product')
      console.error('Product deletion error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onImagesChange = (newImages: ImageFile[]) => {
    setImages(newImages)
  }

  if (status === 'loading' || isLoadingProduct) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/seller/products')}>
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600">Update your product information</p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={deleteProduct}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Product
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter product name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={4}
                  className={`flex min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.description ? 'border-red-500' : 'border-input'
                  }`}
                  placeholder="Describe your product in detail..."
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  {...register('categoryId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a category</option>
                  {productCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  {...register('tags')}
                  placeholder="electronics, wireless, bluetooth"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Inventory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price')}
                  placeholder="0.00"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="compareAtPrice">Compare at Price</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('compareAtPrice')}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="inventory">Inventory *</Label>
                <Input
                  id="inventory"
                  type="number"
                  min="0"
                  {...register('inventory')}
                  placeholder="0"
                  className={errors.inventory ? 'border-red-500' : ''}
                />
                {errors.inventory && (
                  <p className="text-red-600 text-sm mt-1">{errors.inventory.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder="PROD-001"
                />
              </div>

              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('weight')}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  {...register('dimensions')}
                  placeholder="L x W x H"
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Images</h2>
            <ImageUpload
              maxFiles={10}
              maxSize={5}
              onImagesChange={onImagesChange}
              existingImages={product?.images || []}
            />
          </div>

          {/* SEO Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">SEO Settings (Optional)</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  {...register('metaTitle')}
                  placeholder="SEO title for search engines"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <textarea
                  id="metaDescription"
                  {...register('metaDescription')}
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Brief description for search engines (160 characters max)"
                />
              </div>
            </div>
          </div>

          {/* Publish Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Publish Settings</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {watchedStatus === 'DRAFT' && 'Product will be saved as draft and not visible to customers'}
                  {watchedStatus === 'ACTIVE' && 'Product will be published and visible to customers'}
                  {watchedStatus === 'INACTIVE' && 'Product will be hidden from customers'}
                  {watchedStatus === 'OUT_OF_STOCK' && 'Product will be marked as out of stock'}
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="featured"
                  type="checkbox"
                  {...register('featured')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="featured" className="ml-2">
                  Feature this product
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[150px]"
            >
              {isLoading ? (
                'Updating...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}