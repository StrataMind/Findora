import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.isAdmin) {
    redirect('/');
  }

  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' }
  });

  const orders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif">Dashboard</h1>
        <Link href="/dashboard/products/new" className="bg-black text-white px-6 py-2 hover:bg-neutral-800">
          Add Product
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="border border-neutral-200 p-6">
          <h3 className="text-neutral-600 mb-2">Total Products</h3>
          <p className="text-3xl font-semibold">{products.length}</p>
        </div>
        <div className="border border-neutral-200 p-6">
          <h3 className="text-neutral-600 mb-2">Total Orders</h3>
          <p className="text-3xl font-semibold">{orders.length}</p>
        </div>
        <div className="border border-neutral-200 p-6">
          <h3 className="text-neutral-600 mb-2">Revenue</h3>
          <p className="text-3xl font-semibold">
            ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-serif mb-6">Products</h2>
        <div className="border border-neutral-200">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Inventory</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-neutral-200">
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">${product.price.toFixed(2)}</td>
                  <td className="p-4">{product.inventory}</td>
                  <td className="p-4">
                    <Link href={`/dashboard/products/${product.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-serif mb-6">Recent Orders</h2>
        <div className="border border-neutral-200">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left p-4">Order #</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-neutral-200">
                  <td className="p-4">{order.orderNumber}</td>
                  <td className="p-4">{order.shippingName}</td>
                  <td className="p-4">${order.total.toFixed(2)}</td>
                  <td className="p-4">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
