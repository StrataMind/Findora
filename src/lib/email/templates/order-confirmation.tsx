import { BaseEmailTemplate } from './base'
import { Order } from '@/lib/order-management'
import { format } from 'date-fns'

interface OrderConfirmationEmailProps {
  order: Order
  customerName: string
  trackingUrl?: string
}

export function OrderConfirmationEmail({ order, customerName, trackingUrl }: OrderConfirmationEmailProps) {
  return (
    <BaseEmailTemplate
      title="Order Confirmation - Findora"
      previewText={`Your order ${order.orderNumber} has been confirmed for ₹${order.totalAmount}`}
    >
      {/* Welcome Message */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '8px' }}>
          Thank you for your order, {customerName}!
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          Your order has been confirmed and we're preparing it for shipment.
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="section-title">Order Summary</h2>
          <span className="status-badge status-success">Confirmed</span>
        </div>
        
        <table style={{ width: '100%', marginBottom: '16px' }}>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Order Number:</td>
            <td style={{ padding: '8px 0', fontWeight: 'bold', textAlign: 'right' }}>{order.orderNumber}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Order Date:</td>
            <td style={{ padding: '8px 0', textAlign: 'right' }}>{format(order.createdAt, 'MMMM dd, yyyy')}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Payment Status:</td>
            <td style={{ padding: '8px 0', textAlign: 'right' }}>
              <span className="status-badge status-success">Paid</span>
            </td>
          </tr>
          {order.estimatedDeliveryDate && (
            <tr>
              <td style={{ padding: '8px 0', color: '#64748b' }}>Expected Delivery:</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>
                {format(order.estimatedDeliveryDate, 'MMMM dd, yyyy')}
              </td>
            </tr>
          )}
        </table>
      </div>

      {/* Order Items */}
      <div className="card">
        <h2 className="section-title">Order Items</h2>
        <div style={{ marginBottom: '20px' }}>
          {order.items.map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px 0', 
              borderBottom: index < order.items.length - 1 ? '1px solid #e2e8f0' : 'none' 
            }}>
              <img 
                src={item.productImage} 
                alt={item.productName}
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginRight: '16px' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>{item.productName}</h3>
                <p style={{ fontSize: '14px', color: '#64748b' }}>SKU: {item.productSku}</p>
                <p style={{ fontSize: '14px', color: '#64748b' }}>Sold by: {item.sellerName}</p>
                {item.attributes && (
                  <div style={{ marginTop: '4px' }}>
                    {Object.entries(item.attributes).map(([key, value]) => (
                      <span key={key} style={{ 
                        fontSize: '12px', 
                        backgroundColor: '#e2e8f0', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        marginRight: '4px' 
                      }}>
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '600' }}>₹{item.unitPrice} × {item.quantity}</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>₹{item.totalPrice}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Total */}
        <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '16px' }}>
          <table style={{ width: '100%', fontSize: '14px' }}>
            <tr>
              <td style={{ padding: '4px 0' }}>Subtotal:</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>₹{order.subtotal}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>Shipping:</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>₹{order.shippingCost}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>Tax:</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>₹{order.taxAmount}</td>
            </tr>
            {order.discountAmount > 0 && (
              <tr style={{ color: '#059669' }}>
                <td style={{ padding: '4px 0' }}>Discount:</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>-₹{order.discountAmount}</td>
              </tr>
            )}
            <tr style={{ fontSize: '18px', fontWeight: 'bold', borderTop: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px 0 4px 0' }}>Total:</td>
              <td style={{ padding: '12px 0 4px 0', textAlign: 'right' }}>₹{order.totalAmount}</td>
            </tr>
          </table>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="card">
        <h2 className="section-title">Delivery Address</h2>
        <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
          <p style={{ fontWeight: '600', marginBottom: '8px' }}>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
          <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
          <p>{order.shippingAddress.pincode}, {order.shippingAddress.country}</p>
          <p style={{ marginTop: '8px' }}><strong>Phone:</strong> {order.shippingAddress.phone}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        {trackingUrl ? (
          <a href={trackingUrl} className="btn" style={{ marginRight: '16px' }}>
            Track Your Order
          </a>
        ) : (
          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`} className="btn" style={{ marginRight: '16px' }}>
            View Order Details
          </a>
        )}
        <a href={`${process.env.NEXT_PUBLIC_APP_URL}/products`} className="btn btn-outline">
          Continue Shopping
        </a>
      </div>

      {/* Important Information */}
      <div style={{ 
        backgroundColor: '#fef3c7', 
        border: '1px solid #f59e0b', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ color: '#92400e', fontWeight: '600', marginBottom: '8px' }}>Important Information</h3>
        <ul style={{ color: '#92400e', fontSize: '14px', paddingLeft: '20px' }}>
          <li>Please keep this email for your records</li>
          <li>You'll receive shipping notifications when your order ships</li>
          <li>Contact customer support if you need to make changes</li>
          <li>Orders typically ship within 1-2 business days</li>
        </ul>
      </div>

      {/* Customer Support */}
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Need Help?</h3>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Our customer support team is here to help 24/7
        </p>
        <div style={{ marginTop: '12px' }}>
          <a href="mailto:support@findora.com" style={{ color: '#3b82f6', textDecoration: 'none', marginRight: '16px' }}>
            Email Support
          </a>
          <a href="tel:+911234567890" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            Call +91-123-456-7890
          </a>
        </div>
      </div>
    </BaseEmailTemplate>
  )
}

export default OrderConfirmationEmail