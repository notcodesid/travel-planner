import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    const trips = await prisma.trip.findMany({
      where: ownerId ? { owner_id: ownerId } : {},
      include: {
        days: {
          include: {
            stops: {
              orderBy: { stop_index: 'asc' }
            }
          },
          orderBy: { day_index: 'asc' }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      trips
    });

  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch trips'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, startDate, endDate, budgetBand, pace, foodPrefs, ownerId } = body;

    // Validate required fields
    if (!city || !startDate || !endDate || !budgetBand || !pace) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const trip = await prisma.trip.create({
      data: {
        city,
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        budget_band: budgetBand,
        pace,
        food_prefs: foodPrefs || [],
        owner_id: ownerId,
      },
      include: {
        days: {
          include: {
            stops: {
              orderBy: { stop_index: 'asc' }
            }
          },
          orderBy: { day_index: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      trip
    });

  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create trip'
    }, { status: 500 });
  }
}