import { BaseEmailTemplate } from './base'
import { Order } from '@/lib/order-management'
import { format } from 'date-fns'

interface SellerNewOrderEmailProps {
  order: Order
  sellerName: string
  dashboardUrl: string
}

export function SellerNewOrderEmail({ order, sellerName, dashboardUrl }: SellerNewOrderEmailProps) {
  return (
    <BaseEmailTemplate
      title="New Order Received - Findora"
      previewText={`New order ${order.orderNumber} for ₹${order.totalAmount} from ${order.customerName}`}
    >
      {/* Alert Header */}
      <div style={{ 
        backgroundColor: '#10b981', 
        color: 'white', 
        borderRadius: '8px', 
        padding: '20px', 
        textAlign: 'center', 
        marginBottom: '24px' 
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛒</div>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>New Order Received!</h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          You have a new order worth ₹{order.totalAmount}
        </p>
      </div>

      {/* Greeting */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '8px' }}>
          Hi {sellerName},
        </h2>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          Congratulations! You've received a new order. Here are the details:
        </p>
      </div>

      {/* Order Details Card */}
      <div className="card">
        <h2 className="section-title">Order Information</h2>
        
        <table style={{ width: '100%', marginBottom: '16px' }}>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Order Number:</td>
            <td style={{ padding: '8px 0', fontWeight: 'bold', textAlign: 'right' }}>{order.orderNumber}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Order Date:</td>
            <td style={{ padding: '8px 0', textAlign: 'right' }}>{format(order.createdAt, 'MMMM dd, yyyy HH:mm')}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Customer:</td>
            <td style={{ padding: '8px 0', fontWeight: '600', textAlign: 'right' }}>{order.customerName}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Total Amount:</td>
            <td style={{ padding: '8px 0', fontSize: '18px', fontWeight: 'bold', color: '#059669', textAlign: 'right' }}>
              ₹{order.totalAmount}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Payment Status:</td>
            <td style={{ padding: '8px 0', textAlign: 'right' }}>
              <span className="status-badge status-success">
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </td>
          </tr>
        </table>

        {/* Priority Badge */}
        {order.priority === 'high' && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #f87171', 
            borderRadius: '6px', 
            padding: '8px 12px', 
            display: 'inline-block' 
          }}>
            <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 'bold' }}>
              🔥 HIGH PRIORITY ORDER
            </span>
          </div>
        )}
      </div>

      {/* Customer Information */}
      <div className="card">
        <h2 className="section-title">Customer Information</h2>
        <table style={{ width: '100%' }}>
          <tr>
            <td style={{ padding: '6px 0', color: '#64748b' }}>Name:</td>
            <td style={{ padding: '6px 0', fontWeight: '600' }}>{order.customerName}</td>
          </tr>
          <tr>
            <td style={{ padding: '6px 0', color: '#64748b' }}>Email:</td>
            <td style={{ padding: '6px 0' }}>{order.customerEmail}</td>
          </tr>
          <tr>
            <td style={{ padding: '6px 0', color: '#64748b' }}>Phone:</td>
            <td style={{ padding: '6px 0' }}>{order.customerPhone}</td>
          </tr>
        </table>
      </div>

      {/* Order Items */}
      <div className="card">
        <h2 className="section-title">Items to Ship ({order.items.length})</h2>
        <div>
          {order.items.map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 0', 
              borderBottom: index < order.items.length - 1 ? '1px solid #e2e8f0' : 'none' 
            }}>
              <img 
                src={item.productImage} 
                alt={item.productName}
                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', marginRight: '12px' }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', marginBottom: '2px' }}>{item.productName}</p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>SKU: {item.productSku}</p>
                {item.attributes && (
                  <div style={{ marginTop: '4px' }}>
                    {Object.entries(item.attributes).map(([key, value]) => (
                      <span key={key} style={{ 
                        fontSize: '11px', 
                        backgroundColor: '#e2e8f0', 
                        padding: '2px 6px', 
                        borderRadius: '3px', 
                        marginRight: '4px' 
                      }}>
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', color: '#64748b' }}>Qty: {item.quantity}</p>
                <p style={{ fontWeight: '600' }}>₹{item.totalPrice}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="card">
        <h2 className="section-title">Ship To</h2>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ fontWeight: '600', marginBottom: '4px' }}>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
          <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
          <p><strong>{order.shippingAddress.pincode}</strong>, {order.shippingAddress.country}</p>
          <div style={{ marginTop: '12px', padding: '8px 0', borderTop: '1px solid #e2e8f0' }}>
            <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
            {order.shippingAddress.landmark && (
              <p><strong>Landmark:</strong> {order.shippingAddress.landmark}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Required */}
      <div style={{ 
        backgroundColor: '#fef3c7', 
        border: '1px solid #f59e0b', 
        borderRadius: '8px', 
        padding: '20px', 
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#92400e', fontWeight: '600', marginBottom: '8px' }}>⏰ Action Required</h3>
        <p style={{ color: '#92400e', fontSize: '14px', marginBottom: '16px' }}>
          Please process this order within 24 hours to maintain your seller rating.
        </p>
        <a href={`${dashboardUrl}/orders/${order.id}`} className="btn">
          Process Order Now
        </a>
      </div>

      {/* Quick Actions */}
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <a href={`${dashboardUrl}/orders/${order.id}`} className="btn" style={{ marginRight: '16px' }}>
          View Full Order
        </a>
        <a href={`${dashboardUrl}/orders`} className="btn btn-outline">
          All Orders
        </a>
      </div>

      {/* Seller Tips */}
      <div className="card">
        <h2 className="section-title">💡 Seller Tips</h2>
        <ul style={{ color: '#64748b', fontSize: '14px', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>Fast Processing:</strong> Ship within 24 hours to boost your seller rating
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Communication:</strong> Keep customers updated on order status
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Quality Packaging:</strong> Ensure items are well-protected during shipping
          </li>
          <li>
            <strong>Tracking Updates:</strong> Add tracking information as soon as you ship
          </li>
        </ul>
      </div>

      {/* Support */}
      <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
          Need help with this order?
        </p>
        <a href="mailto:seller-support@findora.com" style={{ color: '#3b82f6', textDecoration: 'none', marginRight: '16px' }}>
          Contact Seller Support
        </a>
        <a href={`${process.env.NEXT_PUBLIC_APP_URL}/seller/help`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Seller Help Center
        </a>
      </div>
    </BaseEmailTemplate>
  )
}

export default SellerNewOrderEmail