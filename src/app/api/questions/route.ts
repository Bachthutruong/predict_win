import { NextRequest, NextResponse } from 'next/server';
import { getQuestions } from '@/app/actions';

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  try {
    const questions = await getQuestions();
    
    return NextResponse.json(
      { questions },
      { 
        status: 200,
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('API Error - Get Questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
} 