import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface GenerateItineraryRequest {
  city: string;
  startDate: string;
  endDate: string;
  budgetBand: string;
  pace: string;
  foodPrefs: string[];
  ownerId?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateItineraryRequest = await request.json();
    const { city, startDate, endDate, budgetBand, pace, foodPrefs, ownerId } = body;

    // Validate required fields
    if (!city || !startDate || !endDate || !budgetBand || !pace) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Generate mock itinerary (replace with actual AI generation)
    const mockItinerary = generateMockItinerary(city, diffDays, budgetBand, pace);

    // Create trip with days and stops in database
    const trip = await prisma.trip.create({
      data: {
        city,
        start_date: start,
        end_date: end,
        budget_band: budgetBand,
        pace,
        food_prefs: foodPrefs,
        owner_id: ownerId,
        days: {
          create: mockItinerary.days.map((day, index) => ({
            day_index: index + 1,
            theme: day.theme,
            stops: {
              create: day.stops.map((stop, stopIndex) => ({
                stop_index: stopIndex + 1,
                title: stop.title,
                address: stop.address,
                start_time: stop.start_time,
                duration_mins: stop.duration_mins,
                est_cost: stop.est_cost,
                url: stop.url,
              }))
            }
          }))
        }
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
    console.error('Error generating itinerary:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate itinerary'
    }, { status: 500 });
  }
}

function generateMockItinerary(city: string, days: number, budget: string, pace: string) {
  const themes = ['Historical Sites', 'Cultural Exploration', 'Local Cuisine', 'Nature & Parks', 'Shopping & Markets', 'Art & Museums'];
  const activities = {
    'Historical Sites': [
      { title: 'Ancient Monument Tour', duration: 120, cost: 15 },
      { title: 'Historic Downtown Walk', duration: 90, cost: 0 },
      { title: 'Cathedral Visit', duration: 60, cost: 5 }
    ],
    'Cultural Exploration': [
      { title: 'Local Market Visit', duration: 90, cost: 20 },
      { title: 'Traditional Performance', duration: 120, cost: 25 },
      { title: 'Cultural Center Tour', duration: 75, cost: 12 }
    ],
    'Local Cuisine': [
      { title: 'Street Food Tour', duration: 120, cost: 35 },
      { title: 'Cooking Class', duration: 180, cost: 65 },
      { title: 'Local Restaurant Lunch', duration: 90, cost: 40 }
    ]
  };

  const itinerary = {
    days: Array.from({ length: days }, (_, dayIndex) => {
      const theme = themes[dayIndex % themes.length];
      const dayActivities = activities[theme as keyof typeof activities] || activities['Historical Sites'];
      
      return {
        theme,
        stops: Array.from({ length: pace === 'packed' ? 4 : 3 }, (_, stopIndex) => {
          const activity = dayActivities[stopIndex % dayActivities.length];
          const hour = 9 + stopIndex * 3;
          
          return {
            title: `${activity.title} in ${city}`,
            address: `${city} City Center`,
            start_time: `${hour.toString().padStart(2, '0')}:00`,
            duration_mins: activity.duration,
            est_cost: Math.round(activity.cost * (budget === 'tight' ? 0.7 : budget === 'comfortable' ? 1.3 : 1)),
            url: `https://example.com/${activity.title.toLowerCase().replace(/\s+/g, '-')}`
          };
        })
      };
    })
  };

  return itinerary;
}