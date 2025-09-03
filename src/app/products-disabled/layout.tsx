import { Suspense } from 'react'

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="p-8">Loading products...</div>}>
      {children}
    </Suspense>
  )
}