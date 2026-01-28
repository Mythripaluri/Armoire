// --- Supabase Edge Function Handler ---
// This handler sets CORS headers and responds to OPTIONS, GET, POST requests

export default async function handler(req: Request): Promise<Response> {
  // Set CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // For demonstration, return mock weather data
  const weather = await WeatherService.getCurrentLocationWeather();
  return new Response(JSON.stringify(weather), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
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

interface OpenWeatherResponse {
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  name: string;
}

/**
 * Weather Service
 * Handles weather data fetching and outfit recommendations based on weather
 */
export class WeatherService {
  private static readonly API_KEY = process.env.VITE_OPENWEATHER_API_KEY;
  private static readonly BASE_URL =
    "https://api.openweathermap.org/data/2.5/weather";

  /**
   * Get weather data for a specific location
   */
  static async getWeatherByLocation(
    lat: number,
    lon: number
  ): Promise<WeatherData | null> {
    if (!this.API_KEY) {
      console.warn("OpenWeather API key not configured, using mock data");
      return this.getMockWeatherData();
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: OpenWeatherResponse = await response.json();
      return this.formatWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return this.getMockWeatherData();
    }
  }

  /**
   * Get weather data for a city name
   */
  static async getWeatherByCity(city: string): Promise<WeatherData | null> {
    if (!this.API_KEY) {
      console.warn("OpenWeather API key not configured, using mock data");
      return this.getMockWeatherData();
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}?q=${encodeURIComponent(city)}&appid=${
          this.API_KEY
        }&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: OpenWeatherResponse = await response.json();
      return this.formatWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return this.getMockWeatherData();
    }
  }

  /**
   * Get user's current location weather
   */
  static async getCurrentLocationWeather(): Promise<WeatherData | null> {
    try {
      const position = await this.getCurrentPosition();
      return await this.getWeatherByLocation(
        position.coords.latitude,
        position.coords.longitude
      );
    } catch (error) {
      console.error("Error getting current location weather:", error);
      return this.getMockWeatherData();
    }
  }

  /**
   * Get current position using geolocation API
   */
  private static getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: true,
      });
    });
  }

  /**
   * Format OpenWeather API response to our WeatherData interface
   */
  private static formatWeatherData(data: OpenWeatherResponse): WeatherData {
    const weather = data.weather[0];

    return {
      temperature: Math.round(data.main.temp),
      condition: weather.main,
      description: weather.description,
      icon: this.getWeatherEmoji(weather.main),
      location: data.name,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      feelsLike: Math.round(data.main.feels_like),
    };
  }

  /**
   * Get weather emoji based on condition
   */
  private static getWeatherEmoji(condition: string): string {
    const emojiMap: Record<string, string> = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Thunderstorm: "⛈️",
      Snow: "❄️",
      Mist: "🌫️",
      Fog: "🌫️",
      Haze: "🌫️",
    };

    return emojiMap[condition] || "🌤️";
  }

  /**
   * Get weather-based outfit suggestions
   */
  static getWeatherOutfitSuggestions(weather: WeatherData): {
    clothing: string[];
    colors: string[];
    accessories: string[];
    tips: string[];
  } {
    const temperature = weather.temperature;
    const condition = weather.condition.toLowerCase();

    // Base suggestions
    let clothing: string[] = [];
    let colors: string[] = [];
    let accessories: string[] = [];
    let tips: string[] = [];

    // Temperature-based suggestions
    if (temperature < 5) {
      clothing = ["Heavy coat", "Sweater", "Long pants", "Boots", "Warm socks"];
      colors = ["Dark colors", "Navy", "Black", "Burgundy"];
      accessories = ["Scarf", "Gloves", "Warm hat", "Thick socks"];
      tips = [
        "Layer up for warmth",
        "Choose insulating materials",
        "Protect extremities",
      ];
    } else if (temperature < 15) {
      clothing = ["Light jacket", "Long sleeves", "Jeans", "Closed shoes"];
      colors = ["Earth tones", "Neutral colors", "Warm colors"];
      accessories = ["Light scarf", "Cardigan"];
      tips = ["Perfect for layering", "Bring a light jacket"];
    } else if (temperature < 25) {
      clothing = ["T-shirt", "Light sweater", "Jeans or chinos", "Sneakers"];
      colors = ["Any colors work", "Spring colors", "Pastels"];
      accessories = ["Light cardigan", "Sunglasses"];
      tips = [
        "Comfortable weather for most outfits",
        "Layer for temperature changes",
      ];
    } else {
      clothing = ["Light clothing", "Shorts", "T-shirt", "Sandals"];
      colors = ["Light colors", "White", "Pastels", "Bright colors"];
      accessories = ["Sunglasses", "Hat", "Light scarf"];
      tips = [
        "Stay cool with breathable fabrics",
        "Choose light colors",
        "Stay hydrated",
      ];
    }

    // Weather condition adjustments
    if (condition.includes("rain") || condition.includes("drizzle")) {
      clothing.push("Waterproof jacket", "Umbrella");
      accessories.push("Waterproof shoes", "Umbrella");
      tips.push(
        "Choose waterproof materials",
        "Avoid light colors that show water stains"
      );
    }

    if (condition.includes("snow")) {
      clothing.push("Waterproof boots", "Warm layers");
      accessories.push("Gloves", "Winter hat");
      tips.push("Choose non-slip footwear", "Layer for easy adjustment");
    }

    if (condition.includes("sun") || condition.includes("clear")) {
      accessories.push("Sunglasses", "Sun hat");
      tips.push("Protect from UV rays", "Choose breathable fabrics");
    }

    if (
      condition.includes("wind") ||
      (weather.windSpeed && weather.windSpeed > 10)
    ) {
      tips.push("Secure loose clothing", "Consider wind-resistant materials");
    }

    return { clothing, colors, accessories, tips };
  }

  /**
   * Mock weather data for development/fallback
   */
  private static getMockWeatherData(): WeatherData {
    const mockConditions = [
      {
        condition: "Clear",
        description: "Clear skies",
        icon: "☀️",
        temp: 22,
        humidity: 45,
      },
      {
        condition: "Clouds",
        description: "Partly cloudy",
        icon: "⛅",
        temp: 18,
        humidity: 60,
      },
      {
        condition: "Rain",
        description: "Light rain",
        icon: "🌧️",
        temp: 15,
        humidity: 80,
      },
      {
        condition: "Snow",
        description: "Light snow",
        icon: "❄️",
        temp: -2,
        humidity: 75,
      },
    ];

    const randomWeather =
      mockConditions[Math.floor(Math.random() * mockConditions.length)];

    return {
      temperature: randomWeather.temp,
      condition: randomWeather.condition,
      description: randomWeather.description,
      icon: randomWeather.icon,
      location: "Your Location",
      humidity: randomWeather.humidity,
      windSpeed: Math.random() * 15,
      feelsLike: randomWeather.temp + (Math.random() * 4 - 2), // ±2 degrees
    };
  }
}

// Legacy function for backward compatibility
export const getWeatherData = async (): Promise<WeatherData> => {
  const weather = await WeatherService.getCurrentLocationWeather();
  return weather || WeatherService["getMockWeatherData"]();
};

// For real OpenWeather API integration, add your API key as a secret
// and create an edge function to make the API call
