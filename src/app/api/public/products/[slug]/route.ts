import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await db.product.findFirst({
      where: {
        slug: params.slug,
        status: 'ACTIVE',
        seller: {
          verificationStatus: 'VERIFIED'
        }
      },
      include: {
        images: {
          orderBy: { position: 'asc' }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        seller: {
          select: {
            id: true,
            businessName: true,
            verificationStatus: true,
            averageRating: true,
            totalRatings: true,
            description: true,
            logoUrl: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Get latest 10 reviews
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0

    // Get related products from the same category
    const relatedProducts = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        status: 'ACTIVE',
        id: { not: product.id },
        seller: {
          verificationStatus: 'VERIFIED'
        }
      },
      include: {
        images: {
          orderBy: { position: 'asc' },
          take: 1
        },
        seller: {
          select: {
            businessName: true,
            verificationStatus: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      take: 4
    })

    // Format related products
    const formattedRelatedProducts = relatedProducts.map(relatedProduct => {
      const relatedAvgRating = relatedProduct.reviews.length > 0
        ? relatedProduct.reviews.reduce((sum, review) => sum + review.rating, 0) / relatedProduct.reviews.length
        : 0

      return {
        id: relatedProduct.id,
        name: relatedProduct.name,
        price: relatedProduct.price,
        compareAtPrice: relatedProduct.compareAtPrice,
        slug: relatedProduct.slug,
        images: relatedProduct.images,
        seller: relatedProduct.seller,
        averageRating: Math.round(relatedAvgRating * 10) / 10,
        totalReviews: relatedProduct.reviews.length
      }
    })

    const productDetails = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      sku: product.sku,
      inventory: product.inventory,
      weight: product.weight,
      dimensions: product.dimensions,
      slug: product.slug,
      featured: product.featured,
      tags: product.tags,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      images: product.images,
      category: product.category,
      seller: product.seller,
      reviews: product.reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: product._count.reviews,
      totalSales: product._count.orderItems,
      relatedProducts: formattedRelatedProducts,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }

    return NextResponse.json({
      success: true,
      product: productDetails
    })

  } catch (error) {
    console.error('Get public product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}