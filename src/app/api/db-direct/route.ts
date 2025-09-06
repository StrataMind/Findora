import { NextResponse } from 'next/server'

// SECURITY: This endpoint has been disabled for security reasons
// Direct database access should never be exposed via API endpoints
export async function GET() {
  return NextResponse.json({
    error: 'Endpoint disabled for security reasons',
    message: 'Direct database access is not allowed via public API'
  }, { status: 403 })
}

export async function POST() {
  return NextResponse.json({
    error: 'Endpoint disabled for security reasons',
    message: 'Direct database access is not allowed via public API'
  }, { status: 403 })
}

export async function PUT() {
  return NextResponse.json({
    error: 'Endpoint disabled for security reasons', 
    message: 'Direct database access is not allowed via public API'
  }, { status: 403 })
}

export async function DELETE() {
  return NextResponse.json({
    error: 'Endpoint disabled for security reasons',
    message: 'Direct database access is not allowed via public API'
  }, { status: 403 })
}