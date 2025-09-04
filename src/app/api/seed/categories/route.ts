import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const categories = [
      {
        name: 'Clothing & Fashion',
        slug: 'clothing-fashion',
        description: 'Apparel, shoes, accessories and fashion items'
      },
      {
        name: 'Electronics',
        slug: 'electronics', 
        description: 'Smartphones, laptops, gadgets and electronic devices'
      },
      {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Furniture, decor, kitchen and home improvement items'
      },
      {
        name: 'Books & Education',
        slug: 'books-education',
        description: 'Books, educational materials and learning resources'
      },
      {
        name: 'Sports & Outdoor',
        slug: 'sports-outdoor',
        description: 'Sports equipment, outdoor gear and fitness items'
      },
      {
        name: 'Health & Beauty',
        slug: 'health-beauty',
        description: 'Skincare, cosmetics, health and wellness products'
      },
      {
        name: 'Toys & Games',
        slug: 'toys-games',
        description: 'Toys, board games, puzzles and entertainment'
      },
      {
        name: 'Automotive',
        slug: 'automotive',
        description: 'Car accessories, parts and automotive supplies'
      },
      {
        name: 'Food & Beverages',
        slug: 'food-beverages',
        description: 'Snacks, drinks, gourmet foods and specialty items'
      },
      {
        name: 'Art & Crafts',
        slug: 'art-crafts',
        description: 'Art supplies, handmade items and craft materials'
      }
    ]

    // Check if categories already exist
    const existingCount = await db.category.count()
    
    if (existingCount > 0) {
      return NextResponse.json({
        message: `Categories already exist (${existingCount} found)`,
        action: 'skipped'
      })
    }

    // Create categories
    const createdCategories = await Promise.all(
      categories.map(category => 
        db.category.create({ data: category })
      )
    )

    return NextResponse.json({
      message: `Created ${createdCategories.length} product categories`,
      action: 'created',
      categories: createdCategories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug
      }))
    })

  } catch (error) {
    console.error('Error seeding categories:', error)
    return NextResponse.json({
      error: 'Failed to seed categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST() // Allow GET for easy browser testing
}