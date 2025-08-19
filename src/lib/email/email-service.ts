/**
 * Email Service Integration
 * 
 * This module provides integration with various email service providers
 * like SendGrid, AWS SES, Resend, etc. for sending transactional emails.
 */

import { render } from '@react-email/render'
import { ReactElement } from 'react'

export interface EmailProvider {
  name: string
  apiKey: string
  apiEndpoint?: string
  fromEmail: string
  fromName: string
}

export interface EmailMessage {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject: string
  htmlContent: string
  textContent: string
  attachments?: {
    filename: string
    content: Buffer | string
    type: string
  }[]
  headers?: Record<string, string>
  tags?: string[]
  metadata?: Record<string, any>
}

export interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
  provider: string
}

class EmailService {
  private provider: EmailProvider
  private retryAttempts: number = 3
  private retryDelay: number = 1000 // ms

  constructor(provider: EmailProvider) {
    this.provider = provider
  }

  /**
   * Send email using configured provider
   */
  async sendEmail(message: EmailMessage): Promise<EmailResponse> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`Sending email attempt ${attempt}/${this.retryAttempts}:`, {
          to: message.to,
          subject: message.subject,
          provider: this.provider.name
        })

        const response = await this.sendWithProvider(message)
        
        if (response.success) {
          console.log('Email sent successfully:', response.messageId)
          return response
        }
        
        throw new Error(response.error || 'Email send failed')

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        console.error(`Email send attempt ${attempt} failed:`, lastError.message)
        
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt)
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Failed to send email after retries',
      provider: this.provider.name
    }
  }

  /**
   * Send email using React component template
   */
  async sendEmailWithTemplate(
    template: ReactElement,
    to: string | string[],
    subject: string,
    options?: {
      cc?: string | string[]
      bcc?: string | string[]
      attachments?: EmailMessage['attachments']
      tags?: string[]
      metadata?: Record<string, any>
    }
  ): Promise<EmailResponse> {
    try {
      const htmlContent = render(template)
      const textContent = render(template, { plainText: true })

      return await this.sendEmail({
        to,
        subject,
        htmlContent,
        textContent,
        ...options
      })
    } catch (error) {
      console.error('Failed to render email template:', error)
      return {
        success: false,
        error: 'Failed to render email template',
        provider: this.provider.name
      }
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(messages: EmailMessage[]): Promise<EmailResponse[]> {
    const results: EmailResponse[] = []
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 10
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)
      const batchPromises = batch.map(message => this.sendEmail(message))
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // Add delay between batches
      if (i + batchSize < messages.length) {
        await this.delay(500)
      }
    }
    
    return results
  }

  /**
   * Send email with specific provider implementation
   */
  private async sendWithProvider(message: EmailMessage): Promise<EmailResponse> {
    switch (this.provider.name.toLowerCase()) {
      case 'sendgrid':
        return this.sendWithSendGrid(message)
      
      case 'ses':
      case 'aws-ses':
        return this.sendWithAWSSES(message)
      
      case 'resend':
        return this.sendWithResend(message)
      
      case 'nodemailer':
        return this.sendWithNodemailer(message)
      
      default:
        return this.sendWithMockProvider(message)
    }
  }

  /**
   * SendGrid implementation
   */
  private async sendWithSendGrid(message: EmailMessage): Promise<EmailResponse> {
    try {
      const payload = {
        personalizations: [{
          to: Array.isArray(message.to) 
            ? message.to.map(email => ({ email }))
            : [{ email: message.to }],
          subject: message.subject
        }],
        from: {
          email: this.provider.fromEmail,
          name: this.provider.fromName
        },
        content: [
          {
            type: 'text/plain',
            value: message.textContent
          },
          {
            type: 'text/html',
            value: message.htmlContent
          }
        ]
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.provider.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        return {
          success: true,
          messageId: response.headers.get('X-Message-Id') || undefined,
          provider: 'sendgrid'
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.errors?.[0]?.message || `SendGrid API error: ${response.status}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SendGrid send failed',
        provider: 'sendgrid'
      }
    }
  }

  /**
   * AWS SES implementation
   */
  private async sendWithAWSSES(message: EmailMessage): Promise<EmailResponse> {
    try {
      // TODO: Implement AWS SES integration
      // This would require AWS SDK and proper credential configuration
      console.log('AWS SES integration not yet implemented')
      
      return {
        success: false,
        error: 'AWS SES integration not implemented',
        provider: 'aws-ses'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AWS SES send failed',
        provider: 'aws-ses'
      }
    }
  }

  /**
   * Resend implementation
   */
  private async sendWithResend(message: EmailMessage): Promise<EmailResponse> {
    try {
      const payload = {
        from: `${this.provider.fromName} <${this.provider.fromEmail}>`,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.htmlContent,
        text: message.textContent,
        tags: message.tags
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.provider.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          messageId: data.id,
          provider: 'resend'
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Resend API error: ${response.status}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Resend send failed',
        provider: 'resend'
      }
    }
  }

  /**
   * Nodemailer implementation (for development/testing)
   */
  private async sendWithNodemailer(message: EmailMessage): Promise<EmailResponse> {
    try {
      // TODO: Implement Nodemailer integration
      // This would be used primarily for development/testing
      console.log('Nodemailer integration not yet implemented')
      
      return {
        success: false,
        error: 'Nodemailer integration not implemented',
        provider: 'nodemailer'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Nodemailer send failed',
        provider: 'nodemailer'
      }
    }
  }

  /**
   * Mock provider for development
   */
  private async sendWithMockProvider(message: EmailMessage): Promise<EmailResponse> {
    console.log('📧 MOCK EMAIL SENT:', {
      provider: this.provider.name,
      from: `${this.provider.fromName} <${this.provider.fromEmail}>`,
      to: message.to,
      subject: message.subject,
      htmlLength: message.htmlContent.length,
      textLength: message.textContent.length,
      timestamp: new Date().toISOString()
    })

    // Simulate API delay
    await this.delay(Math.random() * 1000 + 500)

    // Simulate occasional failures for testing
    if (Math.random() < 0.05) {
      throw new Error('Mock email provider failure')
    }

    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      provider: this.provider.name
    }
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Create email service instance
 */
export function createEmailService(config?: {
  provider?: 'sendgrid' | 'ses' | 'resend' | 'nodemailer' | 'mock'
  apiKey?: string
  fromEmail?: string
  fromName?: string
}): EmailService {
  const provider: EmailProvider = {
    name: config?.provider || 'mock',
    apiKey: config?.apiKey || process.env.EMAIL_API_KEY || 'mock-api-key',
    fromEmail: config?.fromEmail || process.env.EMAIL_FROM_ADDRESS || 'noreply@findora.com',
    fromName: config?.fromName || process.env.EMAIL_FROM_NAME || 'Findora'
  }

  return new EmailService(provider)
}

// Default email service instance
export const emailService = createEmailService({
  provider: (process.env.EMAIL_PROVIDER as any) || 'mock'
})

export default emailService