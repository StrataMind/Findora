import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').optional(),
  slug: z.string().min(1, 'Category slug is required').optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().nullable().optional(),
})

// GET /api/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await db.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
        parent: true,
        children: {
          include: {
            _count: {
              select: {
                products: true,
                children: true,
              },
            },
          },
        },
        products: {
          take: 10,
          include: {
            images: true,
            _count: {
              select: {
                orderItems: true,
                reviews: true,
              },
            },
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user?.email || '' },
      include: { sellerProfile: true },
    })

    if (!user?.sellerProfile) {
      return NextResponse.json(
        { error: 'Seller account required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id: params.id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if slug already exists (excluding current category)
    if (validatedData.slug && validatedData.slug !== existingCategory.slug) {
      const existingSlug = await db.category.findUnique({
        where: { slug: validatedData.slug },
      })

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Category slug already exists' },
          { status: 400 }
        )
      }
    }

    // Check if name already exists (excluding current category)
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const existingName = await db.category.findUnique({
        where: { name: validatedData.name },
      })

      if (existingName) {
        return NextResponse.json(
          { error: 'Category name already exists' },
          { status: 400 }
        )
      }
    }

    // If parentId is provided, check if parent exists and prevent circular reference
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

      // Prevent setting parent to self or descendant
      if (validatedData.parentId === params.id) {
        return NextResponse.json(
          { error: 'Category cannot be its own parent' },
          { status: 400 }
        )
      }

      // Check for circular reference by getting all descendants
      const descendants = await getDescendants(params.id)
      if (descendants.includes(validatedData.parentId)) {
        return NextResponse.json(
          { error: 'Cannot create circular reference' },
          { status: 400 }
        )
      }
    }

    const category = await db.category.update({
      where: { id: params.id },
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

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user?.email || '' },
      include: { sellerProfile: true },
    })

    if (!user?.sellerProfile) {
      return NextResponse.json(
        { error: 'Seller account required' },
        { status: 403 }
      )
    }

    // Check if category exists
    const category = await db.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with products. Move or delete products first.' },
        { status: 400 }
      )
    }

    // Check if category has children
    if (category._count.children > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories. Move or delete subcategories first.' },
        { status: 400 }
      )
    }

    await db.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}

// Helper function to get all descendants of a category
async function getDescendants(categoryId: string): Promise<string[]> {
  const descendants: string[] = []
  
  const children = await db.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  })

  for (const child of children) {
    descendants.push(child.id)
    const childDescendants = await getDescendants(child.id)
    descendants.push(...childDescendants)
  }

  return descendants
}