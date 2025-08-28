import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    // Mock data for now since database is not set up
    const trips: any[] = [];

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

    // Mock trip creation for now
    const trip = {
      id: 'mock-trip-id',
      city,
      start_date: new Date(startDate),
      end_date: new Date(endDate),
      budget_band: budgetBand,
      pace,
      food_prefs: foodPrefs || [],
      owner_id: ownerId,
      days: []
    };

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