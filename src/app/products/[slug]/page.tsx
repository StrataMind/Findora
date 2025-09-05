'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import BackButton from '@/components/ui/back-button'
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  Package,
  Plus,
  Minus
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  slug: string
  inventory: number
  weight?: number
  dimensions?: string
  images: Array<{
    id: string
    url: string
    alt: string
    isPrimary: boolean
  }>
  seller: {
    id: string
    businessName: string
    description?: string
    averageRating: number
    totalReviews: number
    verificationStatus: string
  }
  category: {
    name: string
    slug: string
  }
  _count: {
    reviews: number
    orderItems: number
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (params?.slug) {
      loadProduct(params.slug as string)
    }
  }, [params?.slug])

  const loadProduct = async (slug: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/public/products/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
      } else {
        toast({
          title: "Error",
          description: "Product not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error loading product:', error)
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart",
        variant: "destructive",
      })
      return
    }

    setAddingToCart(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product?.id,
          quantity,
        }),
      })

      if (response.ok) {
        toast({
          title: "Added to cart",
          description: `${quantity} item(s) added to your cart`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to add to cart",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const discountPercentage = product?.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <BackButton href="/products" label="Back to Products" />
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-gray-200 rounded-lg mb-4">
                {product.images?.[selectedImage] ? (
                  <img
                    src={product.images[selectedImage].url}
                    alt={product.images[selectedImage].alt || product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-24 h-24" />
                  </div>
                )}
              </div>
              
              {/* Image Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {product.category.name}
                </Link>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Seller Info */}
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Sold by</p>
                  <p className="font-semibold text-gray-900">
                    {product.seller.businessName}
                    {product.seller.verificationStatus === 'VERIFIED' && (
                      <Shield className="w-4 h-4 text-green-500 inline ml-2" />
                    )}
                  </p>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {product.seller.averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-400 ml-1">
                    ({product.seller.totalReviews} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Stock */}
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  {product.inventory > 0 ? (
                    <span className="text-green-600">
                      ✓ In stock ({product.inventory} available)
                    </span>
                  ) : (
                    <span className="text-red-600">✗ Out of stock</span>
                  )}
                </p>
              </div>

              {/* Quantity and Add to Cart */}
              {product.inventory > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 min-w-[50px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleAddToCart}
                      disabled={addingToCart || product.inventory === 0}
                      className="flex-1 flex items-center justify-center gap-2"
                      size="lg"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </Button>
                    <Button variant="outline" size="lg">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="lg">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>30-day return policy</span>
                  </div>
                  {product.weight && (
                    <div className="text-gray-600">
                      Weight: {product.weight}kg
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="text-gray-600">
                      Dimensions: {product.dimensions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products or Reviews section can be added here */}
      </div>
    </div>
  )
}