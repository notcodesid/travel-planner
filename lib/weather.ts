interface WeatherData {
  date: string;
  temperature: number;
  description: string;
  icon: string;
}

interface WeatherResponse {
  success: boolean;
  data?: WeatherData[];
  error?: string;
}

export async function getWeatherForecast(
  city: string, 
  startDate: string, 
  endDate: string
): Promise<WeatherResponse> {
  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    
    if (!apiKey) {
      // Return mock data if no API key is provided
      return getMockWeatherData(startDate, endDate);
    }

    // First, get coordinates for the city
    const geocodeResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
    );

    if (!geocodeResponse.ok) {
      throw new Error('Failed to get city coordinates');
    }

    const geocodeData = await geocodeResponse.json();
    if (!geocodeData.length) {
      throw new Error('City not found');
    }

    const { lat, lon } = geocodeData[0];

    // Get weather forecast
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!weatherResponse.ok) {
      throw new Error('Failed to get weather data');
    }

    const weatherData = await weatherResponse.json();

    // Process the forecast data for the trip dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const forecast: WeatherData[] = [];

    const currentDate = new Date(start);
    let forecastIndex = 0;

    while (currentDate <= end && forecastIndex < weatherData.list.length) {
      const forecastItem = weatherData.list[forecastIndex];
      const forecastDate = new Date(forecastItem.dt * 1000);
      
      // Get the forecast for around midday for each day
      if (forecastDate.getHours() >= 12 && forecastDate.getDate() === currentDate.getDate()) {
        forecast.push({
          date: currentDate.toISOString().split('T')[0],
          temperature: Math.round(forecastItem.main.temp),
          description: forecastItem.weather[0].description,
          icon: getWeatherEmoji(forecastItem.weather[0].main),
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      forecastIndex++;
    }

    return {
      success: true,
      data: forecast,
    };

  } catch (error) {
    console.error('Weather API error:', error);
    // Fall back to mock data on error
    return getMockWeatherData(startDate, endDate);
  }
}

function getMockWeatherData(startDate: string, endDate: string): WeatherResponse {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const forecast: WeatherData[] = [];
  
  const currentDate = new Date(start);
  let dayIndex = 0;
  
  const mockWeathers = [
    { temp: 22, desc: 'sunny', icon: '☀️' },
    { temp: 18, desc: 'partly cloudy', icon: '⛅' },
    { temp: 25, desc: 'sunny', icon: '☀️' },
    { temp: 20, desc: 'light rain', icon: '🌦️' },
    { temp: 23, desc: 'clear', icon: '☀️' },
  ];

  while (currentDate <= end) {
    const weather = mockWeathers[dayIndex % mockWeathers.length];
    forecast.push({
      date: currentDate.toISOString().split('T')[0],
      temperature: weather.temp + Math.floor(Math.random() * 6) - 3, // ±3 degrees variation
      description: weather.desc,
      icon: weather.icon,
    });
    currentDate.setDate(currentDate.getDate() + 1);
    dayIndex++;
  }

  return {
    success: true,
    data: forecast,
  };
}

function getWeatherEmoji(weatherMain: string): string {
  const weatherEmojis: { [key: string]: string } = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Fog: '🌫️',
    Haze: '🌫️',
  };

  return weatherEmojis[weatherMain] || '🌤️';
}

export async function getCurrentWeather(city: string) {
  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    
    if (!apiKey) {
      return {
        success: true,
        data: {
          temperature: 22,
          description: 'sunny',
          icon: '☀️'
        }
      };
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Failed to get weather data');
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: getWeatherEmoji(data.weather[0].main),
      }
    };

  } catch (error) {
    console.error('Current weather API error:', error);
    return {
      success: true,
      data: {
        temperature: 22,
        description: 'sunny',
        icon: '☀️'
      }
    };
  }
}