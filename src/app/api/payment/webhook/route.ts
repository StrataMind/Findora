import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Razorpay Webhook Handler
 * 
 * This endpoint handles webhooks from Razorpay for payment status updates.
 * Webhooks provide reliable notification of payment events.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // TODO: Verify webhook signature when you have webhook secret
    /*
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }
    */

    const payload = JSON.parse(body)
    const { event, payload: eventPayload } = payload

    console.log('Razorpay webhook received:', {
      event,
      paymentId: eventPayload.payment?.entity?.id,
      orderId: eventPayload.payment?.entity?.order_id,
      amount: eventPayload.payment?.entity?.amount
    })

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(eventPayload.payment.entity)
        break

      case 'payment.failed':
        await handlePaymentFailed(eventPayload.payment.entity)
        break

      case 'order.paid':
        await handleOrderPaid(eventPayload.order.entity)
        break

      case 'payment.dispute.created':
        await handleDisputeCreated(eventPayload.dispute.entity)
        break

      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCaptured(payment: any) {
  console.log('Payment captured:', payment.id)
  
  // TODO: Update order status in database
  // TODO: Send confirmation email to customer
  // TODO: Trigger fulfillment process
  // TODO: Update inventory
  
  try {
    // Example database update (implement with your DB)
    /*
    await db.order.update({
      where: { razorpayOrderId: payment.order_id },
      data: { 
        status: 'PAID',
        paymentId: payment.id,
        paidAt: new Date()
      }
    })
    */
    
    console.log('Order updated successfully for payment:', payment.id)
  } catch (error) {
    console.error('Failed to update order:', error)
  }
}

async function handlePaymentFailed(payment: any) {
  console.log('Payment failed:', payment.id)
  
  // TODO: Update order status
  // TODO: Notify customer of failed payment
  // TODO: Release inventory hold
  
  try {
    // Example database update
    /*
    await db.order.update({
      where: { razorpayOrderId: payment.order_id },
      data: { 
        status: 'PAYMENT_FAILED',
        failureReason: payment.error_description
      }
    })
    */
    
    console.log('Order marked as payment failed:', payment.id)
  } catch (error) {
    console.error('Failed to update failed payment order:', error)
  }
}

async function handleOrderPaid(order: any) {
  console.log('Order fully paid:', order.id)
  
  // TODO: Final order confirmation processing
  // TODO: Analytics tracking
}

async function handleDisputeCreated(dispute: any) {
  console.log('Payment dispute created:', dispute.id)
  
  // TODO: Notify admin team
  // TODO: Log dispute for manual review
  // TODO: Send customer communication
}

export async function GET() {
  return NextResponse.json(
    { message: 'Razorpay webhook endpoint. Use POST method.' },
    { status: 405 }
  )
}