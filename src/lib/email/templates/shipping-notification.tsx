import { BaseEmailTemplate } from './base'
import { Order, ShippingInfo } from '@/lib/order-management'
import { format, addDays } from 'date-fns'

interface ShippingNotificationEmailProps {
  order: Order
  shippingInfo: ShippingInfo
  customerName: string
  estimatedDeliveryDate: Date
}

export function ShippingNotificationEmail({ 
  order, 
  shippingInfo, 
  customerName, 
  estimatedDeliveryDate 
}: ShippingNotificationEmailProps) {
  const deliveryPartnerName = {
    'delhivery': 'Delhivery',
    'bluedart': 'Blue Dart',
    'ecom_express': 'Ecom Express',
    'xpressbees': 'XpressBees',
    'dtdc': 'DTDC',
    'fedex': 'FedEx',
    'india_post': 'India Post',
    'ekart': 'Ekart Logistics',
    'amazon_logistics': 'Amazon Logistics'
  }[shippingInfo.deliveryPartner] || shippingInfo.deliveryPartner

  return (
    <BaseEmailTemplate
      title="Order Shipped - Findora"
      previewText={`Your order ${order.orderNumber} has been shipped and is on its way!`}
    >
      {/* Shipping Confirmation */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ 
          backgroundColor: '#10b981', 
          borderRadius: '50px', 
          width: '80px', 
          height: '80px', 
          margin: '0 auto 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
            <path d="M3 16.5v2c0 1.05.95 2 2 2h14c1.05 0 2-.95 2-2v-2M7 14l3 3 6-6" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '8px' }}>
          Your Order is on the Way!
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          Hi {customerName}, we've shipped your order and it's heading your way.
        </p>
      </div>

      {/* Shipping Details Card */}
      <div className="card">
        <h2 className="section-title">Shipping Details</h2>
        
        <table style={{ width: '100%', marginBottom: '20px' }}>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b', width: '40%' }}>Order Number:</td>
            <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{order.orderNumber}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Tracking ID:</td>
            <td style={{ padding: '8px 0', fontFamily: 'monospace', fontWeight: 'bold' }}>{shippingInfo.trackingId}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Carrier:</td>
            <td style={{ padding: '8px 0' }}>{deliveryPartnerName}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Shipped Date:</td>
            <td style={{ padding: '8px 0' }}>{format(shippingInfo.shippedDate || new Date(), 'MMMM dd, yyyy')}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Expected Delivery:</td>
            <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#059669' }}>
              {format(estimatedDeliveryDate, 'EEEE, MMMM dd, yyyy')}
            </td>
          </tr>
        </table>

        {/* Delivery Timeline */}
        <div style={{ 
          backgroundColor: '#dbeafe', 
          border: '1px solid #3b82f6', 
          borderRadius: '8px', 
          padding: '16px', 
          textAlign: 'center' 
        }}>
          <h3 style={{ color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>
            📦 Your package will arrive in {Math.ceil((estimatedDeliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
          </h3>
          <p style={{ color: '#1e40af', fontSize: '14px' }}>
            We'll send you updates as your package moves closer to you
          </p>
        </div>
      </div>

      {/* Shipped Items */}
      <div className="card">
        <h2 className="section-title">Items Shipped</h2>
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
                <p style={{ fontSize: '12px', color: '#64748b' }}>Qty: {item.quantity}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '600' }}>₹{item.totalPrice}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="card">
        <h2 className="section-title">Delivery Address</h2>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ fontWeight: '600', marginBottom: '4px' }}>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
          <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
          <p>{order.shippingAddress.pincode}, {order.shippingAddress.country}</p>
          <p style={{ marginTop: '8px' }}><strong>Phone:</strong> {order.shippingAddress.phone}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <a href={shippingInfo.trackingUrl} className="btn" style={{ marginRight: '16px' }}>
          Track Your Package
        </a>
        <a href={`${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`} className="btn btn-outline">
          View Order Details
        </a>
      </div>

      {/* Tracking Instructions */}
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #0ea5e9', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ color: '#0c4a6e', fontWeight: '600', marginBottom: '8px' }}>📱 Track Your Package</h3>
        <div style={{ color: '#0c4a6e', fontSize: '14px' }}>
          <p><strong>Tracking ID:</strong> {shippingInfo.trackingId}</p>
          <p style={{ marginTop: '8px' }}>
            You can track your package using the tracking ID above on the {deliveryPartnerName} website or app.
          </p>
          <p style={{ marginTop: '8px' }}>
            <strong>Pro tip:</strong> Save the tracking ID for quick access to real-time updates!
          </p>
        </div>
      </div>

      {/* What's Next */}
      <div className="card">
        <h2 className="section-title">What happens next?</h2>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              borderRadius: '50%', 
              width: '24px', 
              height: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              marginRight: '12px',
              flexShrink: 0
            }}>1</span>
            <div>
              <p style={{ fontWeight: '600', color: '#1e293b' }}>Package Processing</p>
              <p>Your package is being prepared at our fulfillment center</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              borderRadius: '50%', 
              width: '24px', 
              height: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              marginRight: '12px',
              flexShrink: 0
            }}>2</span>
            <div>
              <p style={{ fontWeight: '600', color: '#1e293b' }}>In Transit</p>
              <p>Your package will be picked up and begin its journey to you</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              borderRadius: '50%', 
              width: '24px', 
              height: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              marginRight: '12px',
              flexShrink: 0
            }}>3</span>
            <div>
              <p style={{ fontWeight: '600', color: '#1e293b' }}>Delivered</p>
              <p>Your package will be delivered to your doorstep</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Seller */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>
          Have questions about your order? Contact the seller directly.
        </p>
        <a href={`${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}#messages`} className="btn btn-outline">
          Message Seller
        </a>
      </div>
    </BaseEmailTemplate>
  )
}

export default ShippingNotificationEmail