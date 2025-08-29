import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Trip ID is required'
      }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id },
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

    if (!trip) {
      return NextResponse.json({
        success: false,
        error: 'Trip not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      trip
    });

  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch trip'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Trip ID is required'
      }, { status: 400 });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: body,
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
      trip: updatedTrip
    });

  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update trip'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Trip ID is required'
      }, { status: 400 });
    }

    await prisma.trip.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Trip deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete trip'
    }, { status: 500 });
  }
}