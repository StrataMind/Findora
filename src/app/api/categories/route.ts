import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Category slug is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
})

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'
    const parentId = searchParams.get('parentId')
    const search = searchParams.get('search')

    const where: Record<string, any> = {}

    // Filter by parent category
    if (parentId === 'null' || parentId === '') {
      where.parentId = null
    } else if (parentId) {
      where.parentId = parentId
    }

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const categories = await db.category.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
        parent: true,
        children: includeProducts ? {
          include: {
            _count: {
              select: {
                products: true,
                children: true,
              },
            },
          },
        } : true,
        ...(includeProducts && {
          products: {
            take: 5,
            include: {
              images: true,
            },
          },
        }),
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      categories,
      total: categories.length,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user?.email! },
      include: { seller: true },
    })

    if (!user?.seller) {
      return NextResponse.json(
        { error: 'Seller account required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)

    // Check if slug already exists
    const existingSlug = await db.category.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Category slug already exists' },
        { status: 400 }
      )
    }

    // Check if name already exists
    const existingName = await db.category.findUnique({
      where: { name: validatedData.name },
    })

    if (existingName) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      )
    }

    // If parentId is provided, check if parent exists
    if (validatedData.parentId) {
      const parentCategory = await db.category.findUnique({
        where: { id: validatedData.parentId },
      })

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        )
      }
    }

    const category = await db.category.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
        parent: true,
        children: true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}