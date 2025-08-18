import { Metadata } from 'next'

// SEO Optimization - Dynamic Metadata Generation
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/products/${params.slug}`, {
      next: { revalidate: 60 } // Cache for 1 minute
    })
    
    if (!response.ok) {
      return {
        title: 'Product Not Found - Findora',
        description: 'The requested product could not be found.',
      }
    }

    const product = await response.json()
    
    const title = product.metaTitle || `${product.name} - Findora`
    const description = product.metaDescription || product.description?.substring(0, 160) || `Buy ${product.name} from ${product.seller.businessName} on Findora marketplace.`
    const imageUrl = product.images?.[0]?.url || '/icon-512x512.svg'
    const productUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/products/${product.slug}`

    return {
      title,
      description,
      keywords: product.tags?.join(', ') || `${product.name}, ${product.category?.name}, marketplace, buy online`,
      authors: [{ name: product.seller.businessName }],
      openGraph: {
        title,
        description,
        url: productUrl,
        siteName: 'Findora Marketplace',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          }
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: productUrl,
      },
      other: {
        // Structured Data for SEO
        'product:price:amount': product.price.toString(),
        'product:price:currency': 'USD',
        'product:availability': product.inventory > 0 ? 'in stock' : 'out of stock',
        'product:condition': 'new',
        'product:brand': product.seller.businessName,
        'product:category': product.category?.name || 'General',
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Product - Findora',
      description: 'Discover amazing products on Findora marketplace.',
    }
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "Product Name",
            "description": "Product Description",
            "brand": {
              "@type": "Brand",
              "name": "Findora"
            },
            "offers": {
              "@type": "Offer",
              "url": "Product URL",
              "priceCurrency": "USD",
              "price": "0",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />
    </>
  )
}