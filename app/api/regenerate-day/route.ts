import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RegenerateDayRequest {
  tripId: string;
  dayId: string;
  dayIndex: number;
  city: string;
  budget: string;
  pace: string;
  theme?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegenerateDayRequest = await request.json();
    const { tripId, dayId, dayIndex, city, budget, pace, theme } = body;

    if (!tripId || !dayId || !dayIndex || !city || !budget || !pace) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Verify the trip and day exist
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        days: {
          where: { id: dayId },
          include: { stops: true }
        }
      }
    });

    if (!trip || !trip.days.length) {
      return NextResponse.json({
        success: false,
        error: 'Trip or day not found'
      }, { status: 404 });
    }

    // Generate new itinerary for the day
    const newDayData = generateNewDayItinerary(city, dayIndex, budget, pace, theme);

    // Delete existing stops and create new ones
    await prisma.tripStop.deleteMany({
      where: { day_id: dayId }
    });

    // Update the day with new theme and stops
    const updatedDay = await prisma.tripDay.update({
      where: { id: dayId },
      data: {
        theme: newDayData.theme,
        stops: {
          create: newDayData.stops.map((stop, index) => ({
            stop_index: index + 1,
            title: stop.title,
            address: stop.address,
            start_time: stop.start_time,
            duration_mins: stop.duration_mins,
            est_cost: stop.est_cost,
            url: stop.url,
          }))
        }
      },
      include: {
        stops: {
          orderBy: { stop_index: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      day: updatedDay
    });

  } catch (error) {
    console.error('Error regenerating day:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to regenerate day'
    }, { status: 500 });
  }
}

function generateNewDayItinerary(city: string, dayIndex: number, budget: string, pace: string, preferredTheme?: string) {
  const themes = [
    'Historical Exploration', 
    'Cultural Immersion', 
    'Food & Culinary', 
    'Nature & Outdoors', 
    'Art & Museums', 
    'Shopping & Markets',
    'Entertainment & Nightlife',
    'Architecture & Landmarks',
    'Local Neighborhoods',
    'Adventure & Sports'
  ];

  const activities = {
    'Historical Exploration': [
      { title: 'Ancient Ruins Tour', duration: 120, cost: 18, address: 'Historic District' },
      { title: 'Heritage Walking Trail', duration: 90, cost: 0, address: 'Old Town' },
      { title: 'Historical Museum Visit', duration: 75, cost: 15, address: 'Museum Quarter' },
      { title: 'Castle or Fort Exploration', duration: 150, cost: 22, address: 'Fortress Area' }
    ],
    'Cultural Immersion': [
      { title: 'Traditional Craft Workshop', duration: 180, cost: 45, address: 'Artisan Quarter' },
      { title: 'Local Festival Experience', duration: 120, cost: 20, address: 'Cultural Center' },
      { title: 'Community Market Visit', duration: 90, cost: 25, address: 'Local Market' },
      { title: 'Cultural Performance Show', duration: 90, cost: 35, address: 'Theater District' }
    ],
    'Food & Culinary': [
      { title: 'Street Food Tour', duration: 150, cost: 40, address: 'Food Street' },
      { title: 'Cooking Class Experience', duration: 180, cost: 70, address: 'Culinary School' },
      { title: 'Local Restaurant Crawl', duration: 120, cost: 55, address: 'Restaurant District' },
      { title: 'Specialty Food Market', duration: 90, cost: 30, address: 'Central Market' }
    ],
    'Nature & Outdoors': [
      { title: 'City Park Exploration', duration: 120, cost: 0, address: 'Central Park' },
      { title: 'Botanical Gardens Visit', duration: 90, cost: 12, address: 'Garden District' },
      { title: 'Outdoor Adventure Activity', duration: 180, cost: 60, address: 'Adventure Park' },
      { title: 'Scenic Viewpoint Hike', duration: 150, cost: 0, address: 'Hilltop Area' }
    ],
    'Art & Museums': [
      { title: 'Contemporary Art Gallery', duration: 90, cost: 20, address: 'Arts District' },
      { title: 'Science Museum Exploration', duration: 120, cost: 25, address: 'Museum Complex' },
      { title: 'Local Artist Studio Tour', duration: 60, cost: 15, address: 'Artist Quarter' },
      { title: 'Interactive Exhibition Visit', duration: 75, cost: 18, address: 'Cultural Center' }
    ]
  };

  // Select theme - either preferred or random
  const theme = preferredTheme && themes.includes(preferredTheme) 
    ? preferredTheme 
    : themes[Math.floor(Math.random() * themes.length)];

  const themeActivities = activities[theme as keyof typeof activities] || activities['Historical Exploration'];
  
  // Generate stops based on pace
  const numStops = pace === 'packed' ? 4 : 3;
  const selectedActivities = themeActivities
    .sort(() => 0.5 - Math.random())
    .slice(0, numStops);

  const stops = selectedActivities.map((activity, index) => {
    const hour = 9 + index * 3;
    const budgetMultiplier = budget === 'tight' ? 0.7 : budget === 'comfortable' ? 1.3 : 1;
    
    return {
      title: `${activity.title} in ${city}`,
      address: `${activity.address}, ${city}`,
      start_time: `${hour.toString().padStart(2, '0')}:00`,
      duration_mins: activity.duration + Math.floor(Math.random() * 30) - 15, // ±15 min variation
      est_cost: Math.round(activity.cost * budgetMultiplier),
      url: `https://example.com/${activity.title.toLowerCase().replace(/\s+/g, '-')}-${city.toLowerCase()}`
    };
  });

  return {
    theme,
    stops
  };
}