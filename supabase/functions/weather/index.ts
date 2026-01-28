// Supabase Edge Function: Weather API with CORS

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  location: string;
  humidity?: number;
  windSpeed?: number;
  feelsLike?: number;
}

// Mock weather data for demonstration
function getMockWeatherData(): WeatherData {
  // Return more realistic current weather data
  return {
    temperature: 25, // Current temperature you mentioned
    condition: "Clear",
    description: "Clear sunny day",
    icon: "☀️",
    location: "Your Location",
    humidity: 45,
    windSpeed: 8,
    feelsLike: 27,
  };
}

Deno.serve(async (req: Request): Promise<Response> => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // For demonstration, return mock weather data
    const weather = getMockWeatherData();
    return new Response(JSON.stringify(weather), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch weather data' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});