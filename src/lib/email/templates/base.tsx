import { ReactNode } from 'react'

interface BaseEmailTemplateProps {
  children: ReactNode
  previewText?: string
  title: string
}

export function BaseEmailTemplate({ children, previewText, title }: BaseEmailTemplateProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        {previewText && (
          <meta name="description" content={previewText} />
        )}
        <style>{`
          /* Reset styles */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
          table { border-collapse: collapse; width: 100%; }
          img { max-width: 100%; height: auto; }
          
          /* Layout */
          .email-container { max-width: 600px; margin: 0 auto; background-color: white; }
          .email-header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .email-body { padding: 30px; }
          .email-footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          
          /* Typography */
          .email-title { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
          .email-subtitle { font-size: 16px; opacity: 0.9; }
          .section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #1e293b; }
          .text-large { font-size: 16px; }
          .text-small { font-size: 14px; color: #64748b; }
          .text-muted { color: #64748b; }
          
          /* Components */
          .btn { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; text-align: center; }
          .btn:hover { background-color: #2563eb; }
          .btn-outline { background-color: transparent; color: #3b82f6; border: 2px solid #3b82f6; }
          .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 16px 0; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: uppercase; }
          .status-success { background-color: #dcfce7; color: #166534; }
          .status-warning { background-color: #fef3c7; color: #92400e; }
          .status-info { background-color: #dbeafe; color: #1e40af; }
          
          /* Layout helpers */
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .items-center { align-items: center; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .mb-4 { margin-bottom: 16px; }
          .mt-4 { margin-top: 16px; }
          .p-4 { padding: 16px; }
          
          /* Responsive */
          @media (max-width: 600px) {
            .email-container { margin: 0 10px; }
            .email-body { padding: 20px; }
            .btn { display: block; margin: 10px 0; }
          }
        `}</style>
      </head>
      <body>
        {previewText && (
          <div style={{ display: 'none', fontSize: '1px', color: 'transparent', lineHeight: '1px', maxHeight: '0px', maxWidth: '0px', opacity: 0, overflow: 'hidden' }}>
            {previewText}
          </div>
        )}
        
        <div className="email-container">
          {/* Header */}
          <div className="email-header">
            <div className="email-title">Findora</div>
            <div className="email-subtitle">Your trusted e-commerce platform</div>
          </div>
          
          {/* Body */}
          <div className="email-body">
            {children}
          </div>
          
          {/* Footer */}
          <div className="email-footer">
            <p>© 2024 Findora. All rights reserved.</p>
            <p style={{ marginTop: '8px' }}>
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Unsubscribe</a> | 
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', marginLeft: '8px' }}>Email Preferences</a> | 
              <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', marginLeft: '8px' }}>Contact Support</a>
            </p>
            <p style={{ marginTop: '12px', fontSize: '12px' }}>
              Findora E-commerce Platform<br />
              123 Business District, Mumbai, Maharashtra 400001<br />
              India
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}