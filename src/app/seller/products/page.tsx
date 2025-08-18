'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckSquare,
  Square,
  MoreVertical,
  ChevronDown,
  Star,
  StarOff
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  sku?: string
  inventory: number
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  featured: boolean
  createdAt: string
  updatedAt: string
  images: { id: string; url: string; altText?: string }[]
  category?: { id: string; name: string; slug: string }
  _count: {
    reviews: number
    orderItems: number
  }
}

interface ProductsResponse {
  success: boolean
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const bulkActionsRef = useRef<HTMLDivElement>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProducts()
    }
  }, [status, currentPage, statusFilter, searchTerm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bulkActionsRef.current && !bulkActionsRef.current.contains(event.target as Node)) {
        setShowBulkActions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data: ProductsResponse = await response.json()
        setProducts(data.products)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchProducts() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete product')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
      ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800' },
      INACTIVE: { label: 'Inactive', color: 'bg-red-100 text-red-800' },
      OUT_OF_STOCK: { label: 'Out of Stock', color: 'bg-yellow-100 text-yellow-800' },
    }
    
    const badge = badges[status as keyof typeof badges] || badges.DRAFT
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
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

  // Bulk Actions Functions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId])
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    }
  }

  const bulkUpdateStatus = async (status: string) => {
    if (selectedProducts.length === 0) return

    setBulkActionLoading(true)
    try {
      const promises = selectedProducts.map(productId =>
        fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        })
      )

      await Promise.all(promises)
      fetchProducts()
      setSelectedProducts([])
      setShowBulkActions(false)
    } catch (error) {
      console.error('Bulk status update failed:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const bulkDelete = async () => {
    if (selectedProducts.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
      return
    }

    setBulkActionLoading(true)
    try {
      const promises = selectedProducts.map(productId =>
        fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        })
      )

      await Promise.all(promises)
      fetchProducts()
      setSelectedProducts([])
      setShowBulkActions(false)
    } catch (error) {
      console.error('Bulk delete failed:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const bulkToggleFeatured = async () => {
    if (selectedProducts.length === 0) return

    setBulkActionLoading(true)
    try {
      const promises = selectedProducts.map(async (productId) => {
        const product = products.find(p => p.id === productId)
        return fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featured: !product?.featured })
        })
      })

      await Promise.all(promises)
      fetchProducts()
      setSelectedProducts([])
      setShowBulkActions(false)
    } catch (error) {
      console.error('Bulk featured toggle failed:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  if (status === 'loading' || loading) {
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
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600">Manage your product inventory</p>
            </div>
            <Button onClick={() => router.push('/seller/products/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.status === 'DRAFT').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.status === 'OUT_OF_STOCK' || p.inventory === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedProducts([])}
                  className="text-blue-700 hover:text-blue-900"
                >
                  Clear selection
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative" ref={bulkActionsRef}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    disabled={bulkActionLoading}
                    className="bg-white"
                  >
                    <MoreVertical className="h-4 w-4 mr-2" />
                    Bulk Actions
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                  {showBulkActions && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Status Actions</div>
                        <button
                          onClick={() => bulkUpdateStatus('ACTIVE')}
                          disabled={bulkActionLoading}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          Mark as Active
                        </button>
                        <button
                          onClick={() => bulkUpdateStatus('INACTIVE')}
                          disabled={bulkActionLoading}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          Mark as Inactive
                        </button>
                        <button
                          onClick={() => bulkUpdateStatus('DRAFT')}
                          disabled={bulkActionLoading}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          Mark as Draft
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Other Actions</div>
                        <button
                          onClick={bulkToggleFeatured}
                          disabled={bulkActionLoading}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 flex items-center"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Toggle Featured
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={bulkDelete}
                          disabled={bulkActionLoading}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first product'
                }
              </p>
              {!searchTerm && statusFilter === 'ALL' && (
                <Button onClick={() => router.push('/seller/products/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Product
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      <button
                        onClick={() => handleSelectAll(selectedProducts.length !== products.length)}
                        className="flex items-center"
                      >
                        {selectedProducts.length === products.length && products.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : selectedProducts.length > 0 ? (
                          <div className="h-4 w-4 bg-blue-600 border-2 border-blue-600 rounded flex items-center justify-center">
                            <div className="h-1 w-2 bg-white"></div>
                          </div>
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inventory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSelectProduct(product.id, !selectedProducts.includes(product.id))}
                          className="flex items-center"
                        >
                          {selectedProducts.includes(product.id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            {product.images.length > 0 ? (
                              <img
                                className="h-16 w-16 rounded-lg object-cover"
                                src={product.images[0].url}
                                alt={product.images[0].altText || product.name}
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.sku && `SKU: ${product.sku}`}
                            </div>
                            {product.category && (
                              <div className="text-xs text-gray-400">
                                {product.category.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.status)}
                        {product.featured && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={product.inventory === 0 ? 'text-red-600 font-medium' : ''}>
                          {product.inventory}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatPrice(product.price)}
                        </div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product._count.orderItems}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/seller/products/${product.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/seller/products/${product.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setCurrentPage(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setCurrentPage(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} total products)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setCurrentPage(pagination.page - 1)}
                      className="rounded-l-md"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => setCurrentPage(pagination.page + 1)}
                      className="rounded-r-md"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}