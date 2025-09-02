export const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics', description: 'Latest electronics', image: '/categories/electronics.jpg', _count: { products: 15 } },
  { id: '2', name: 'Clothing', slug: 'clothing', description: 'Fashion clothing', image: '/categories/clothing.jpg', _count: { products: 23 } },
  { id: '3', name: 'Home & Garden', slug: 'home-garden', description: 'Home essentials', image: '/categories/home.jpg', _count: { products: 12 } },
  { id: '4', name: 'Sports', slug: 'sports', description: 'Sports equipment', image: '/categories/sports.jpg', _count: { products: 8 } },
  { id: '5', name: 'Books', slug: 'books', description: 'Educational books', image: '/categories/books.jpg', _count: { products: 18 } },
  { id: '6', name: 'Beauty', slug: 'beauty', description: 'Beauty products', image: '/categories/beauty.jpg', _count: { products: 9 } }
]

export const mockProducts = [
  {
    id: '1', name: 'iPhone 15 Pro', description: 'Latest iPhone with advanced features', price: 99999, compareAtPrice: 109999,
    sku: 'IP15P-001', inventory: 50, slug: 'iphone-15-pro', status: 'PUBLISHED', featured: true,
    isOfficial: true, categoryId: '1', tags: ['apple', 'smartphone'], createdAt: new Date(),
    _count: { reviews: 24, orderItems: 156 }
  },
  {
    id: '2', name: 'Nike Air Max', description: 'Comfortable running shoes', price: 12999, compareAtPrice: 15999,
    sku: 'NAM-001', inventory: 100, slug: 'nike-air-max', status: 'PUBLISHED', featured: true,
    isOfficial: true, categoryId: '4', tags: ['nike', 'shoes'], createdAt: new Date(),
    _count: { reviews: 18, orderItems: 89 }
  },
  {
    id: '3', name: 'Samsung TV 55"', description: '4K Smart TV with HDR', price: 45999, compareAtPrice: 52999,
    sku: 'STV-55', inventory: 25, slug: 'samsung-tv-55', status: 'PUBLISHED', featured: false,
    isOfficial: true, categoryId: '1', tags: ['samsung', 'tv'], createdAt: new Date(),
    _count: { reviews: 12, orderItems: 34 }
  }
]