// Shared type for wardrobe items
export interface WardrobeItem {
  id?: string;
  user_id?: string;
  name: string;
  type: "tops" | "bottoms" | "shoes" | "accessories" | "outerwear";
  color?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
  created_at?: string;
}
// Client-side API bridge
// This file provides access to backend services through the client's Supabase instance
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "../integrations/supabase/client";

// Re-export supabase client for direct use where needed
export { supabase };

export default async (req, res) => {
  // Set CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // ...your function logic here...

  res.status(200).json({ message: "Success" });
};

// Weather service implementation
export const WeatherService = {
  async getCurrentLocationWeather() {
    try {
      // Call the deployed Edge Function
      const response = await fetch(
        'https://mfsjbqwnxodmtyhizwpn.supabase.co/functions/v1/weather',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const weatherData = await response.json();
      return weatherData;
    } catch (error) {
      console.error("Error fetching weather:", error);
      // Fallback to mock data
      return {
        temperature: 20,
        condition: "unknown",
        description: "Weather unavailable",
        icon: "🌤️",
        location: "Unknown",
        humidity: 50,
        windSpeed: 5,
        feelsLike: 20,
      };
    }
  },
};

// Auth service - using Supabase Auth directly
export const AuthService = {
  signInWithEmail: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signUpWithEmail: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (callback: (event: string, session: unknown) => void) =>
    supabase.auth.onAuthStateChange(callback),
};

// Wardrobe service - using Supabase database
export const WardrobeService = {
  async getItems() {
    const { data, error } = await supabase.from("wardrobe_items").select("*");

    if (error) throw error;
    return data || [];
  },

  async addItem(item: WardrobeItem) {
    // @ts-expect-error Supabase client lacks type for wardrobe_items insert
    const { data, error } = await supabase
      .from("wardrobe_items")
      .insert([item])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async updateItem(id: string, updates: Partial<WardrobeItem>) {
    // @ts-expect-error Supabase client lacks type for wardrobe_items update
    const { data, error } = await supabase
      .from("wardrobe_items")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .from("wardrobe_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// Profile service
export const ProfileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Record<string, unknown>) {
    // @ts-expect-error Supabase client lacks type for profiles upsert
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...updates })
      .select();

    if (error) throw error;
    return data?.[0];
  },
};

// Recommendation service
export const RecommendationService = {
  async getRecommendations(userId: string, weather?: { temperature?: number }) {
    // In a real app, this would use AI/ML algorithms
    // For now, return basic recommendations
    try {
      const items = await WardrobeService.getItems();

      // Simple recommendation logic based on weather
      let filtered: WardrobeItem[] = items;
      if (weather?.temperature) {
        if (weather.temperature > 25) {
          filtered = items.filter(
            (item: WardrobeItem) =>
              item.type === "tops" &&
              (item.tags?.includes("summer") || item.tags?.includes("light"))
          );
        } else if (weather.temperature < 15) {
          filtered = items.filter(
            (item: WardrobeItem) =>
              item.type === "outerwear" ||
              item.tags?.includes("warm") ||
              item.tags?.includes("winter")
          );
        }
      }

      return filtered.slice(0, 6); // Return up to 6 recommendations
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return [];
    }
  },
};
