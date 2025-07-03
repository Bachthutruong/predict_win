import { NextRequest, NextResponse } from 'next/server';
import { getFeedbackItems } from '@/app/actions';
import { getCurrentUser } from '@/lib/auth';

export const revalidate = 30; // Cache for 30 seconds

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const feedbackItems = await getFeedbackItems();
    
    return NextResponse.json(
      { feedbackItems },
      { 
        status: 200,
        headers: {
          'Cache-Control': 's-maxage=30, stale-while-revalidate=15',
        },
      }
    );
  } catch (error) {
    console.error('API Error - Feedback Items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback items' },
      { status: 500 }
    );
  }
} 