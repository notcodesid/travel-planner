import { NextRequest, NextResponse } from 'next/server';
import { getWeatherForecast } from '@/lib/weather';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!city || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: city, startDate, endDate'
      }, { status: 400 });
    }

    const weatherData = await getWeatherForecast(city, startDate, endDate);

    return NextResponse.json(weatherData);

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch weather data'
    }, { status: 500 });
  }
}