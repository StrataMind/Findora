import { BaseEmailTemplate } from './base'

interface SellerLowInventoryEmailProps {
  sellerName: string
  productName: string
  productSku: string
  currentStock: number
  threshold: number
  productUrl: string
  managementUrl: string
  productImage?: string
}

export function SellerLowInventoryEmail({
  sellerName,
  productName,
  productSku,
  currentStock,
  threshold,
  productUrl,
  managementUrl,
  productImage
}: SellerLowInventoryEmailProps) {
  return (
    <BaseEmailTemplate
      title="Low Inventory Alert - Findora"
      previewText={`${productName} is running low - only ${currentStock} units left`}
    >
      {/* Alert Header */}
      <div style={{ 
        backgroundColor: '#f59e0b', 
        color: 'white', 
        borderRadius: '8px', 
        padding: '20px', 
        textAlign: 'center', 
        marginBottom: '24px' 
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚠️</div>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Low Inventory Alert</h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          One of your products is running low on stock
        </p>
      </div>

      {/* Greeting */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '8px' }}>
          Hi {sellerName},
        </h2>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          Your product inventory is running low and needs attention to avoid stockouts.
        </p>
      </div>

      {/* Product Information */}
      <div className="card">
        <h2 className="section-title">Product Details</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          {productImage && (
            <img 
              src={productImage} 
              alt={productName}
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginRight: '16px' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', color: '#1e293b' }}>
              {productName}
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>SKU: {productSku}</p>
          </div>
        </div>

        <table style={{ width: '100%' }}>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Current Stock:</td>
            <td style={{ padding: '8px 0', fontWeight: 'bold', textAlign: 'right', color: '#dc2626', fontSize: '18px' }}>
              {currentStock} units
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Threshold Level:</td>
            <td style={{ padding: '8px 0', textAlign: 'right' }}>{threshold} units</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', color: '#64748b' }}>Status:</td>
            <td style={{ padding: '8px 0', textAlign: 'right' }}>
              <span className="status-badge" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                Low Stock
              </span>
            </td>
          </tr>
        </table>
      </div>

      {/* Impact Warning */}
      <div style={{ 
        backgroundColor: '#fef2f2', 
        border: '1px solid #fca5a5', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>⚡ Potential Impact</h3>
        <ul style={{ color: '#dc2626', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
          <li>New orders may need to be cancelled if stock runs out</li>
          <li>Product visibility may be reduced in search results</li>
          <li>Customer satisfaction may be affected by delays</li>
          <li>Lost sales opportunities during stockout period</li>
        </ul>
      </div>

      {/* Recommended Actions */}
      <div className="card">
        <h2 className="section-title">📋 Recommended Actions</h2>
        <div style={{ fontSize: '14px' }}>
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
              <p style={{ fontWeight: '600', color: '#1e293b' }}>Update Inventory</p>
              <p style={{ color: '#64748b' }}>Add more stock to meet customer demand</p>
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
              <p style={{ fontWeight: '600', color: '#1e293b' }}>Adjust Threshold</p>
              <p style={{ color: '#64748b' }}>Consider increasing the low stock threshold</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
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
            }}>3</span>
            <div>
              <p style={{ fontWeight: '600', color: '#1e293b' }}>Review Sales Velocity</p>
              <p style={{ color: '#64748b' }}>Analyze sales patterns to prevent future stockouts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <a href={managementUrl} className="btn" style={{ marginRight: '16px' }}>
          Update Stock Now
        </a>
        <a href={productUrl} className="btn btn-outline">
          View Product
        </a>
      </div>

      {/* Statistics */}
      <div className="card">
        <h2 className="section-title">📊 Quick Stats</h2>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          <p style={{ marginBottom: '8px' }}>
            <strong>Days of stock remaining:</strong> ~{Math.ceil(currentStock / 2)} days (estimated)
          </p>
          <p style={{ marginBottom: '8px' }}>
            <strong>Recommended reorder quantity:</strong> {threshold * 3} units
          </p>
          <p>
            <strong>Last updated:</strong> Just now
          </p>
        </div>
      </div>

      {/* Inventory Management Tips */}
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #0ea5e9', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ color: '#0c4a6e', fontWeight: '600', marginBottom: '8px' }}>💡 Inventory Tips</h3>
        <ul style={{ color: '#0c4a6e', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
          <li>Set up automatic reorder points to prevent stockouts</li>
          <li>Monitor sales velocity during peak seasons</li>
          <li>Consider safety stock for high-demand products</li>
          <li>Use demand forecasting to optimize inventory levels</li>
        </ul>
      </div>

      {/* Support */}
      <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
          Need help with inventory management?
        </p>
        <a href="mailto:seller-support@findora.com" style={{ color: '#3b82f6', textDecoration: 'none', marginRight: '16px' }}>
          Contact Support
        </a>
        <a href={`${process.env.NEXT_PUBLIC_APP_URL}/seller/help/inventory`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Inventory Guide
        </a>
      </div>
    </BaseEmailTemplate>
  )
}

export default SellerLowInventoryEmail