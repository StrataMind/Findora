import { BaseEmailTemplate } from './base'

interface SellerReviewReceivedEmailProps {
  sellerName: string
  customerName: string
  productName: string
  productSku: string
  rating: number
  reviewText: string
  orderNumber: string
  reviewUrl: string
  productUrl: string
  responseUrl: string
  productImage?: string
}

export function SellerReviewReceivedEmail({
  sellerName,
  customerName,
  productName,
  productSku,
  rating,
  reviewText,
  orderNumber,
  reviewUrl,
  productUrl,
  responseUrl,
  productImage
}: SellerReviewReceivedEmailProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#10b981'
    if (rating >= 3) return '#f59e0b'
    return '#ef4444'
  }

  const getRatingEmoji = (rating: number) => {
    if (rating === 5) return '🌟'
    if (rating === 4) return '⭐'
    if (rating === 3) return '👍'
    if (rating === 2) return '😐'
    return '👎'
  }

  return (
    <BaseEmailTemplate
      title="New Review Received - Findora"
      previewText={`${customerName} left a ${rating}-star review for ${productName}`}
    >
      {/* Alert Header */}
      <div style={{ 
        backgroundColor: getRatingColor(rating), 
        color: 'white', 
        borderRadius: '8px', 
        padding: '20px', 
        textAlign: 'center', 
        marginBottom: '24px' 
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>{getRatingEmoji(rating)}</div>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>New Review Received!</h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          {customerName} reviewed your product
        </p>
      </div>

      {/* Greeting */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '8px' }}>
          Hi {sellerName},
        </h2>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          You've received a new {rating}-star review from a customer. Here are the details:
        </p>
      </div>

      {/* Review Details */}
      <div className="card">
        <h2 className="section-title">Review Details</h2>
        
        {/* Product Info */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          {productImage && (
            <img 
              src={productImage} 
              alt={productName}
              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginRight: '16px' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{productName}</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>SKU: {productSku}</p>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Order: {orderNumber}</p>
          </div>
        </div>

        {/* Rating */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ 
                fontSize: '24px', 
                color: i < rating ? '#fbbf24' : '#d1d5db',
                marginRight: '4px'
              }}>
                ★
              </span>
            ))}
          </div>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: getRatingColor(rating) }}>
            {rating} out of 5 stars
          </p>
        </div>

        {/* Review Text */}
        {reviewText && (
          <div style={{ 
            backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
              <strong>Customer Review:</strong>
            </p>
            <p style={{ fontSize: '16px', fontStyle: 'italic', color: '#1e293b', lineHeight: '1.6' }}>
              "{reviewText}"
            </p>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '12px', textAlign: 'right' }}>
              - {customerName}
            </p>
          </div>
        )}
      </div>

      {/* Response Recommendation */}
      <div style={{ 
        backgroundColor: rating >= 4 ? '#f0fdf4' : '#fef3c7', 
        border: `1px solid ${rating >= 4 ? '#bbf7d0' : '#fde68a'}`, 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ 
          color: rating >= 4 ? '#166534' : '#92400e', 
          fontWeight: '600', 
          marginBottom: '8px' 
        }}>
          {rating >= 4 ? '✅ Great Review!' : '⚠️ Response Recommended'}
        </h3>
        <p style={{ 
          color: rating >= 4 ? '#166534' : '#92400e', 
          fontSize: '14px' 
        }}>
          {rating >= 4 
            ? 'Positive reviews help boost your product visibility and build customer trust. Consider thanking the customer for their feedback.'
            : 'Consider responding to address any concerns and show that you value customer feedback. This can help improve your seller reputation.'
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <a href={responseUrl} className="btn" style={{ marginRight: '16px' }}>
          Respond to Review
        </a>
        <a href={reviewUrl} className="btn btn-outline" style={{ marginRight: '16px' }}>
          View Full Review
        </a>
        <a href={productUrl} className="btn btn-outline">
          View Product
        </a>
      </div>

      {/* Review Management Tips */}
      <div className="card">
        <h2 className="section-title">💡 Review Management Tips</h2>
        <ul style={{ color: '#64748b', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>Respond Professionally:</strong> Thank customers for positive reviews and address concerns constructively
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Be Timely:</strong> Respond to reviews within 24-48 hours when possible
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Learn and Improve:</strong> Use feedback to enhance your products and service
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Encourage Reviews:</strong> Follow up with customers to request honest feedback
          </li>
          <li>
            <strong>Stay Professional:</strong> Keep responses courteous even for negative reviews
          </li>
        </ul>
      </div>

      {/* Performance Impact */}
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #0ea5e9', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ color: '#0c4a6e', fontWeight: '600', marginBottom: '8px' }}>📈 How Reviews Help Your Business</h3>
        <ul style={{ color: '#0c4a6e', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
          <li>Higher ratings increase product visibility in search</li>
          <li>Positive reviews build customer trust and confidence</li>
          <li>Review responses show customer engagement</li>
          <li>Feedback helps you improve product quality</li>
        </ul>
      </div>

      {/* Support */}
      <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
          Need help managing reviews?
        </p>
        <a href="mailto:seller-support@findora.com" style={{ color: '#3b82f6', textDecoration: 'none', marginRight: '16px' }}>
          Contact Support
        </a>
        <a href={`${process.env.NEXT_PUBLIC_APP_URL}/seller/help/reviews`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Review Guidelines
        </a>
      </div>
    </BaseEmailTemplate>
  )
}

export default SellerReviewReceivedEmail