'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import BackButton from '@/components/ui/back-button'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Search, 
  MousePointer, 
  Calendar,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Package,
  DollarSign,
  Users,
  Filter,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

interface AnalyticsData {
  success: boolean
  seller: {
    id: string
    businessName: string
    totalProducts: number
  }
  summary: {
    totalViews: number
    totalImpressions: number
    totalClicks: number
    averageCTR: number
    totalProducts: number
    activeProducts: number
  }
  topProducts: Array<{
    productId: string
    productName: string
    slug: string
    product: any
    metrics: {
      totalViews: number
      uniqueViews: number
      searchImpressions: number
      searchClicks: number
      clickThroughRate: number
      averagePosition: number
      topSearchTerms: Array<{
        term: string
        impressions: number
        clicks: number
        ctr: number
      }>
      viewsBySource: Array<{
        source: string
        views: number
        percentage: number
      }>
      viewsOverTime: Array<{
        date: string
        views: number
        uniqueViews: number
      }>
    }
  }>
  topSearchTerms: Array<{
    term: string
    impressions: number
    clicks: number
    ctr: number
  }>
  viewsOverTime: Array<{
    date: string
    views: number
    uniqueViews: number
  }>
  period: {
    start: string
    end: string
    days: number
  }
}

export default function SellerAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (status === 'authenticated') {
      loadAnalytics()
    }
  }, [status, selectedPeriod, selectedProduct])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        days: selectedPeriod.toString(),
        ...(selectedProduct && { productId: selectedProduct })
      })
      
      const response = await fetch(`/api/seller/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        console.error('Failed to load analytics')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getTrendIcon = (value: number, comparison: number = 0) => {
    if (value > comparison) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (value < comparison) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const exportAnalytics = () => {
    if (!analytics) return
    
    const exportData = {
      seller: analytics.seller,
      summary: analytics.summary,
      period: analytics.period,
      exportedAt: new Date().toISOString(),
      topProducts: analytics.topProducts,
      topSearchTerms: analytics.topSearchTerms
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${analytics.period.start}-to-${analytics.period.end}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600 mb-4">Unable to load analytics data at this time.</p>
          <Button onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
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
              <BackButton href="/seller/dashboard" className="mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Product Analytics</h1>
                <p className="text-gray-600">Track your product performance and insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Period Filter */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
              
              <Button variant="outline" onClick={exportAnalytics}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button onClick={loadAnalytics}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analytics.summary.totalViews)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(analytics.summary.totalViews)}
              <span className="text-sm text-gray-600 ml-1">vs previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Search Impressions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analytics.summary.totalImpressions)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Search className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(analytics.summary.totalImpressions)}
              <span className="text-sm text-gray-600 ml-1">vs previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Click-Through Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.summary.averageCTR.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <MousePointer className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(analytics.summary.averageCTR, 3)}
              <span className="text-sm text-gray-600 ml-1">vs previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.summary.activeProducts}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(analytics.summary.activeProducts)}
              <span className="text-sm text-gray-600 ml-1">of {analytics.summary.totalProducts} total</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Views Over Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Views Over Time</h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {analytics.viewsOverTime.slice(-7).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-16 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <div 
                          className="bg-blue-200 h-2 rounded"
                          style={{ 
                            width: `${Math.max(10, (day.views / Math.max(...analytics.viewsOverTime.map(d => d.views))) * 200)}px` 
                          }}
                        ></div>
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {day.views}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {day.uniqueViews} unique
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Search Terms */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Popular Search Terms</h3>
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {analytics.topSearchTerms.slice(0, 6).map((term, index) => (
                <div key={term.term} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{term.term}</p>
                      <p className="text-xs text-gray-500">
                        {term.impressions} impressions · {term.clicks} clicks
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {term.ctr.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">CTR</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
            <p className="text-sm text-gray-600">Products with the highest views and engagement</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topProducts.map((product, index) => (
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.product.image ? (
                            <img 
                              className="h-10 w-10 rounded object-cover" 
                              src={product.product.image}
                              alt={product.productName}
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(product.product.price)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {formatNumber(product.metrics.totalViews)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatNumber(product.metrics.uniqueViews)} unique
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(product.metrics.searchImpressions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`text-sm font-medium ${
                          product.metrics.clickThroughRate > 5 ? 'text-green-600' :
                          product.metrics.clickThroughRate > 2 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {product.metrics.clickThroughRate.toFixed(1)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.metrics.averagePosition.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link href={`/seller/products/${product.productId}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/products/${product.slug}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Optimize Products</h4>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Improve underperforming products based on analytics data.
            </p>
            <Link href="/seller/products">
              <Button size="sm" className="w-full">
                Manage Products
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">SEO Keywords</h4>
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Use popular search terms to optimize your product listings.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Keywords
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Performance Report</h4>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Get detailed insights and recommendations.
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={exportAnalytics}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}