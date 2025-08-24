import sql from "@/app/api/utils/sql";

// Create a new trip
export async function POST(request) {
  try {
    const body = await request.json();
    const { ownerId, city, startDate, endDate, budgetBand, pace, foodPrefs = [] } = body;

    // Validate required fields
    if (!city || !startDate || !endDate || !budgetBand || !pace) {
      return Response.json(
        { error: 'Missing required fields: city, startDate, endDate, budgetBand, pace' },
        { status: 400 }
      );
    }

    // Validate budget and pace values
    const validBudgets = ['tight', 'medium', 'comfortable'];
    const validPaces = ['relaxed', 'packed'];
    
    if (!validBudgets.includes(budgetBand)) {
      return Response.json(
        { error: 'Invalid budgetBand. Must be one of: tight, medium, comfortable' },
        { status: 400 }
      );
    }

    if (!validPaces.includes(pace)) {
      return Response.json(
        { error: 'Invalid pace. Must be one of: relaxed, packed' },
        { status: 400 }
      );
    }

    // Create the trip
    const result = await sql`
      INSERT INTO trips (owner_id, city, start_date, end_date, budget_band, pace, food_prefs)
      VALUES (${ownerId || null}, ${city}, ${startDate}, ${endDate}, ${budgetBand}, ${pace}, ${foodPrefs})
      RETURNING *
    `;

    const trip = result[0];
    
    return Response.json({
      success: true,
      trip: trip
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating trip:', error);
    return Response.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}

// Get all trips (optionally filtered by owner)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    let trips;
    if (ownerId) {
      trips = await sql`
        SELECT * FROM trips 
        WHERE owner_id = ${ownerId}
        ORDER BY created_at DESC
      `;
    } else {
      trips = await sql`
        SELECT * FROM trips 
        ORDER BY created_at DESC
        LIMIT 50
      `;
    }

    return Response.json({
      success: true,
      trips: trips
    });

  } catch (error) {
    console.error('Error fetching trips:', error);
    return Response.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}