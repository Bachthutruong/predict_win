import { NextRequest, NextResponse } from 'next/server';
import { getUserProfileData } from '@/app/actions';
import { getCurrentUser } from '@/lib/auth';

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profileData = await getUserProfileData();
    
    return NextResponse.json(
      { profileData },
      { 
        status: 200,
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('API Error - Profile Data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
} 