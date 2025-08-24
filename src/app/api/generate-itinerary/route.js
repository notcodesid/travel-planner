import sql from "@/app/api/utils/sql";

// Generate a complete itinerary for a trip
export async function POST(request) {
  try {
    const body = await request.json();
    const { city, startDate, endDate, budgetBand, pace, foodPrefs = [], ownerId } = body;

    // Validate required fields
    if (!city || !startDate || !endDate || !budgetBand || !pace) {
      return Response.json(
        { error: 'Missing required fields: city, startDate, endDate, budgetBand, pace' },
        { status: 400 }
      );
    }

    // Calculate trip duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end days

    // Create the trip first
    const tripResult = await sql`
      INSERT INTO trips (owner_id, city, start_date, end_date, budget_band, pace, food_prefs)
      VALUES (${ownerId || null}, ${city}, ${startDate}, ${endDate}, ${budgetBand}, ${pace}, ${foodPrefs})
      RETURNING *
    `;

    const trip = tripResult[0];

    // Generate mock itinerary based on preferences
    const itinerary = await generateMockItinerary(city, diffDays, budgetBand, pace, foodPrefs);

    // Save days and stops to database
    const savedDays = [];
    for (const dayData of itinerary.days) {
      // Create day
      const dayResult = await sql`
        INSERT INTO days (trip_id, day_index, theme, notes)
        VALUES (${trip.id}, ${dayData.dayIndex}, ${dayData.theme}, ${dayData.notes || ''})
        RETURNING *
      `;
      
      const day = dayResult[0];
      
      // Create stops for this day
      const savedStops = [];
      for (const stopData of dayData.stops) {
        const stopResult = await sql`
          INSERT INTO stops (day_id, title, address, lat, lng, start_time, duration_mins, est_cost, url)
          VALUES (
            ${day.id}, 
            ${stopData.title}, 
            ${stopData.address || ''}, 
            ${stopData.lat || null}, 
            ${stopData.lng || null}, 
            ${stopData.startTime}, 
            ${stopData.durationMins}, 
            ${parseFloat(stopData.estCost.replace('$', '').replace('Free', '0')) || 0},
            ${stopData.url || ''}
          )
          RETURNING *
        `;
        
        savedStops.push(stopResult[0]);
      }
      
      savedDays.push({
        ...day,
        stops: savedStops
      });
    }

    return Response.json({
      success: true,
      trip: {
        ...trip,
        days: savedDays
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error generating itinerary:', error);
    return Response.json(
      { error: 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
}

// Mock itinerary generation (in real app, this would use AI integrations)
async function generateMockItinerary(city, numDays, budget, pace, foodPrefs) {
  // Mock POI database based on city and preferences
  const mockPOIs = {
    "Paris": {
      culture: [
        { title: "Louvre Museum", lat: 48.8606, lng: 2.3376, cost: 17, duration: 180 },
        { title: "Notre-Dame Cathedral", lat: 48.8530, lng: 2.3499, cost: 0, duration: 90 },
        { title: "Arc de Triomphe", lat: 48.8738, lng: 2.2950, cost: 13, duration: 60 },
      ],
      food: [
        { title: "Le Comptoir du Relais", lat: 48.8506, lng: 2.3387, cost: 45, duration: 90 },
        { title: "Du Pain et des Idées", lat: 48.8676, lng: 2.3632, cost: 25, duration: 45 },
        { title: "L'As du Fallafel", lat: 48.8576, lng: 2.3597, cost: 15, duration: 30 },
      ],
      outdoors: [
        { title: "Luxembourg Gardens", lat: 48.8462, lng: 2.3372, cost: 0, duration: 120 },
        { title: "Seine River Walk", lat: 48.8566, lng: 2.3522, cost: 0, duration: 90 },
        { title: "Trocadéro Gardens", lat: 48.8620, lng: 2.2876, cost: 0, duration: 60 },
      ],
      hidden: [
        { title: "Sainte-Chapelle", lat: 48.8552, lng: 2.3451, cost: 11, duration: 60 },
        { title: "Père Lachaise Cemetery", lat: 48.8619, lng: 2.3937, cost: 0, duration: 90 },
        { title: "Montmartre Village", lat: 48.8867, lng: 2.3431, cost: 5, duration: 120 },
      ]
    }
  };

  // Default POIs if city not found
  const defaultPOIs = {
    culture: [
      { title: "Historic Museum", lat: 0, lng: 0, cost: 25, duration: 120 },
      { title: "Cultural Center", lat: 0, lng: 0, cost: 18, duration: 90 },
      { title: "Art Gallery", lat: 0, lng: 0, cost: 20, duration: 90 },
    ],
    food: [
      { title: "Local Restaurant", lat: 0, lng: 0, cost: 35, duration: 90 },
      { title: "Traditional Cafe", lat: 0, lng: 0, cost: 15, duration: 45 },
      { title: "Street Food Market", lat: 0, lng: 0, cost: 20, duration: 60 },
    ],
    outdoors: [
      { title: "Central Park", lat: 0, lng: 0, cost: 0, duration: 120 },
      { title: "Scenic Viewpoint", lat: 0, lng: 0, cost: 5, duration: 60 },
      { title: "Botanical Garden", lat: 0, lng: 0, cost: 8, duration: 90 },
    ],
    hidden: [
      { title: "Secret Garden", lat: 0, lng: 0, cost: 0, duration: 60 },
      { title: "Local Artisan Shop", lat: 0, lng: 0, cost: 30, duration: 90 },
      { title: "Underground Venue", lat: 0, lng: 0, cost: 15, duration: 120 },
    ]
  };

  const pois = mockPOIs[city] || defaultPOIs;
  
  // Budget multipliers
  const budgetMultiplier = {
    tight: 0.7,
    medium: 1.0,
    comfortable: 1.5
  };

  // Pace determines stops per day
  const stopsPerDay = pace === 'relaxed' ? 3 : 5;
  
  const days = [];
  const themes = ["Historic Downtown", "Cultural Exploration", "Local Flavors", "Hidden Gems", "Scenic Beauty"];

  for (let i = 0; i < Math.min(numDays, 5); i++) {
    const dayTheme = themes[i];
    const stops = [];
    
    // Mix different types of POIs
    const categories = Object.keys(pois);
    let stopCount = 0;
    
    for (let j = 0; j < stopsPerDay && stopCount < 6; j++) {
      const category = categories[j % categories.length];
      const poiList = pois[category];
      
      if (poiList && poiList.length > 0) {
        const poi = poiList[j % poiList.length];
        const adjustedCost = Math.round(poi.cost * budgetMultiplier[budget]);
        
        stops.push({
          title: poi.title,
          address: `${poi.title}, ${city}`,
          lat: poi.lat,
          lng: poi.lng,
          startTime: `${9 + j * 2}:${j % 2 === 0 ? '00' : '30'}`,
          durationMins: poi.duration,
          estCost: adjustedCost === 0 ? 'Free' : `$${adjustedCost}`,
          url: `https://example.com/poi/${poi.title.toLowerCase().replace(/\s+/g, '-')}`
        });
        stopCount++;
      }
    }
    
    days.push({
      dayIndex: i + 1,
      theme: dayTheme,
      notes: `Day ${i + 1} focuses on ${dayTheme.toLowerCase()}`,
      stops: stops
    });
  }

  return { days };
}