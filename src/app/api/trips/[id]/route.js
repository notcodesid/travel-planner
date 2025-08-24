import sql from "@/app/api/utils/sql";

// Get a specific trip with all its days and stops
export async function GET(request, { params: { id } }) {
  try {
    // Get the trip
    const tripResult = await sql`
      SELECT * FROM trips WHERE id = ${id}
    `;

    if (tripResult.length === 0) {
      return Response.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const trip = tripResult[0];

    // Get all days for this trip
    const daysResult = await sql`
      SELECT * FROM days 
      WHERE trip_id = ${id}
      ORDER BY day_index ASC
    `;

    // Get all stops for all days of this trip
    const stopsResult = await sql`
      SELECT s.*, d.day_index
      FROM stops s
      JOIN days d ON s.day_id = d.id
      WHERE d.trip_id = ${id}
      ORDER BY d.day_index ASC, s.start_time ASC
    `;

    // Group stops by day
    const daysWithStops = daysResult.map(day => ({
      ...day,
      stops: stopsResult.filter(stop => stop.day_id === day.id)
    }));

    return Response.json({
      success: true,
      trip: {
        ...trip,
        days: daysWithStops
      }
    });

  } catch (error) {
    console.error('Error fetching trip:', error);
    return Response.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

// Update a specific trip
export async function PUT(request, { params: { id } }) {
  try {
    const body = await request.json();
    const { city, startDate, endDate, budgetBand, pace, foodPrefs } = body;

    // Build update query dynamically
    let updateFields = [];
    let values = [];

    if (city !== undefined) {
      updateFields.push('city = $' + (updateFields.length + 1));
      values.push(city);
    }
    if (startDate !== undefined) {
      updateFields.push('start_date = $' + (updateFields.length + 1));
      values.push(startDate);
    }
    if (endDate !== undefined) {
      updateFields.push('end_date = $' + (updateFields.length + 1));
      values.push(endDate);
    }
    if (budgetBand !== undefined) {
      updateFields.push('budget_band = $' + (updateFields.length + 1));
      values.push(budgetBand);
    }
    if (pace !== undefined) {
      updateFields.push('pace = $' + (updateFields.length + 1));
      values.push(pace);
    }
    if (foodPrefs !== undefined) {
      updateFields.push('food_prefs = $' + (updateFields.length + 1));
      values.push(foodPrefs);
    }

    if (updateFields.length === 0) {
      return Response.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE trips 
      SET ${updateFields.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      trip: result[0]
    });

  } catch (error) {
    console.error('Error updating trip:', error);
    return Response.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

// Delete a specific trip
export async function DELETE(request, { params: { id } }) {
  try {
    const result = await sql`
      DELETE FROM trips WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Trip deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting trip:', error);
    return Response.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}