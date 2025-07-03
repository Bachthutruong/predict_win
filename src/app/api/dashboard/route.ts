import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/app/actions';

export const revalidate = 30; // Cache for 30 seconds

export async function GET(request: NextRequest) {
  try {
    const stats = await getDashboardStats();
    
    return NextResponse.json(
      { stats },
      { 
        status: 200,
        headers: {
          'Cache-Control': 's-maxage=30, stale-while-revalidate=15',
        },
      }
    );
  } catch (error) {
    console.error('API Error - Dashboard Stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 