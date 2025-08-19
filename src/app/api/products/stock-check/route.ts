import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productIds } = body

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Product IDs are required' },
        { status: 400 }
      )
    }

    // Get current stock status for products
    const products = await db.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true,
        inventory: true,
        status: true
      }
    })

    // Create stock status object
    const stockStatus: Record<string, boolean> = {}
    
    products.forEach(product => {
      stockStatus[product.id] = product.inventory > 0 && product.status === 'ACTIVE'
    })

    // Handle products not found (mark as out of stock)
    productIds.forEach((id: string) => {
      if (!(id in stockStatus)) {
        stockStatus[id] = false
      }
    })

    return NextResponse.json({
      success: true,
      stockStatus
    })

  } catch (error) {
    console.error('Stock check error:', error)
    return NextResponse.json(
      { error: 'Failed to check stock status' },
      { status: 500 }
    )
  }
}