import { NextRequest, NextResponse } from 'next/server';
import { getPredictions } from '@/app/actions';

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  try {
    const predictions = await getPredictions();
    
    return NextResponse.json(
      { predictions },
      { 
        status: 200,
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('API Error - Get Predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
} 