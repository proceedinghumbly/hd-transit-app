import { NextRequest, NextResponse } from 'next/server';
import { getTransitsForDate, getCurrentTransits } from '@/lib/ephemeris';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    let transits;
    let calculationDate;
    
    if (dateParam) {
      // Parse provided date
      const date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }
      transits = getTransitsForDate(date);
      calculationDate = date.toISOString();
    } else {
      // Get current transits
      transits = getCurrentTransits();
      calculationDate = new Date().toISOString();
    }

    return NextResponse.json({
      success: true,
      date: calculationDate,
      transits
    });
  } catch (error) {
    console.error('Transit calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate transits', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
