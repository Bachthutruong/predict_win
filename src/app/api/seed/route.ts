import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed-data';

export async function POST() {
  try {
    // Check if this is development environment for safety
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Seeding is not allowed in production' },
        { status: 403 }
      );
    }

    await seedDatabase();
    
    return NextResponse.json({ 
      message: 'Database seeded successfully!',
      adminCredentials: {
        email: 'admin@predictwin.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
} 