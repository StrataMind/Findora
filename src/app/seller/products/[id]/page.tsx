'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  DollarSign, 
  BarChart3,
  Star,
  Calendar,
  Tag,
  Globe,
  AlertTriangle
} from 'lucide-react'

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
  seller: {
    businessName: string
    verificationStatus: string
  }
  reviews: {
    id: string
    rating: number
    title?: string
    comment?: string
    verified: boolean
    createdAt: string
    user: {
      name?: string
      image?: string
    }
  }[]
  _count: {
    reviews: number
    orderItems: number
  }
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export default function ProductDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated' && productId) {
      fetchProduct()
    }
  }, [status, productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
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
      setProduct(data.product)
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/seller/products')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Product deletion error:', error)
      alert('Failed to delete product')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit },
      ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800', icon: Eye },
      INACTIVE: { label: 'Inactive', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      OUT_OF_STOCK: { label: 'Out of Stock', color: 'bg-yellow-100 text-yellow-800', icon: Package },
    }
    
    const badge = badges[status as keyof typeof badges] || badges.DRAFT
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${badge.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.label}
      </span>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateAverageRating = () => {
    if (!product?.reviews.length) return 0
    const total = product.reviews.reduce((sum, review) => sum + review.rating, 0)
    return (total / product.reviews.length).toFixed(1)
  }

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error || 'Product not found'}</p>
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
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-gray-600">Product Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(product.status)}
              {product.featured && (
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                  <Star className="h-4 w-4 mr-1" />
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Images */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
              {product.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.images.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.altText || `${product.name} - Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No images uploaded</p>
                </div>
              )}
            </div>

            {/* Product Description */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h3>
                  <dl className="space-y-2">
                    {product.sku && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">SKU:</dt>
                        <dd className="text-sm font-medium text-gray-900">{product.sku}</dd>
                      </div>
                    )}
                    {product.category && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Category:</dt>
                        <dd className="text-sm font-medium text-gray-900">{product.category.name}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Inventory:</dt>
                      <dd className={`text-sm font-medium ${product.inventory === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.inventory} units
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Physical Properties</h3>
                  <dl className="space-y-2">
                    {product.weight && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Weight:</dt>
                        <dd className="text-sm font-medium text-gray-900">{product.weight} kg</dd>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Dimensions:</dt>
                        <dd className="text-sm font-medium text-gray-900">{product.dimensions}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {product.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            {product.reviews.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {product.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            by {review.user.name || 'Anonymous'}
                          </span>
                          {review.verified && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                      )}
                      {review.comment && (
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Price:</span>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                </div>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Compare At:</span>
                    <span className="text-lg text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-gray-600">Total Sales:</span>
                  </div>
                  <span className="font-semibold text-gray-900">{product._count.orderItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-gray-600">Rating:</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {product._count.reviews > 0 ? `${calculateAverageRating()}/5.0` : 'No reviews'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Stock:</span>
                  </div>
                  <span className={`font-semibold ${product.inventory === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.inventory} units
                  </span>
                </div>
              </div>
            </div>

            {/* Meta Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-900">{formatDate(product.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span className="text-gray-900">{formatDate(product.updatedAt)}</span>
                </div>
                {product.publishedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Published:</span>
                    <span className="text-gray-900">{formatDate(product.publishedAt)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="text-gray-900 font-mono text-xs">{product.id}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => router.push(`/seller/products/${product.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  View Public Page
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={deleteProduct}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}