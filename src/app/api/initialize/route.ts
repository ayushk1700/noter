import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/initialize
 * Initialize app with default data
 * This route can be called to reset data to defaults
 */
export async function POST(request: NextRequest) {
  try {
    // In a real app, this would reset the database
    // For now, we just return a success response
    return NextResponse.json({
      success: true,
      message: 'Application initialized successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to initialize' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/initialize
 * Get initialization status
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    status: 'ready',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}
