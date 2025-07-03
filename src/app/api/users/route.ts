import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '@/app/actions';
import { getCurrentUser } from '@/lib/auth';

export const revalidate = 120; // Cache for 2 minutes

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'staff')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const users = await getUsers();
    
    return NextResponse.json(
      { users },
      { 
        status: 200,
        headers: {
          'Cache-Control': 's-maxage=120, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('API Error - Get Users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 