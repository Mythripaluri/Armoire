import { supabase } from '../integrations/supabase/client';
import { WardrobeItem } from './wardrobe';

export interface OutfitRecommendation {
  items: WardrobeItem[];
  confidence: number;
  reasoning: string;
  mood: string;
  weather_condition?: string;
}

/**
 * Simple Recommendation Service
 * Provides outfit recommendations based on mood, weather, and available wardrobe items
 */
export class RecommendationService {
  /**
   * Generate outfit recommendations based on mood and weather
   */
  static async generateRecommendations(
    userId: string, 
    mood: string, 
    weatherCondition?: string,
    occasion?: string
  ): Promise<{ recommendations: OutfitRecommendation[]; error: Error | null }> {
    try {
      // Get user's wardrobe items
      const { data: wardrobeItems, error: wardrobeError } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', userId);

      if (wardrobeError) throw wardrobeError;

      if (!wardrobeItems || wardrobeItems.length === 0) {
        return { recommendations: [], error: null };
      }

      // Generate recommendations using simple algorithm
      const recommendations = this.generateSimpleRecommendations(
        wardrobeItems as WardrobeItem[],
        mood,
        weatherCondition,
        occasion
      );

      return { recommendations, error: null };
    } catch (error) {
      console.error('Generate recommendations error:', error);
      return { recommendations: [], error: error as Error };
    }
  }

  /**
   * Simple recommendation algorithm
   */
  private static generateSimpleRecommendations(
    wardrobeItems: WardrobeItem[],
    mood: string,
    weatherCondition?: string,
    occasion?: string
  ): OutfitRecommendation[] {
    const recommendations: OutfitRecommendation[] = [];

    // Categorize items
    const tops = wardrobeItems.filter(item => item.type === 'tops');
    const bottoms = wardrobeItems.filter(item => item.type === 'bottoms');
    const shoes = wardrobeItems.filter(item => item.type === 'shoes');
    const accessories = wardrobeItems.filter(item => item.type === 'accessories');

    // Generate combinations based on mood
    const moodColors = this.getMoodColors(mood);
    const weatherAppropriate = this.getWeatherAppropriateItems(wardrobeItems, weatherCondition);

    // Create up to 3 recommendations
    const maxRecommendations = Math.min(3, tops.length, bottoms.length, shoes.length);

    for (let i = 0; i < maxRecommendations; i++) {
      const top = tops[i];
      const bottom = bottoms[i % bottoms.length];
      const shoe = shoes[i % shoes.length];
      
      if (top && bottom && shoe) {
        const items = [top, bottom, shoe];
        
        // Add accessory if available
        if (accessories.length > 0) {
          items.push(accessories[i % accessories.length]);
        }

        // Calculate confidence based on mood and weather matching
        let confidence = 0.5; // Base confidence
        
        // Boost confidence for mood-matching colors
        items.forEach(item => {
          if (item.color && moodColors.includes(item.color.toLowerCase())) {
            confidence += 0.1;
          }
        });

        // Boost confidence for weather-appropriate items
        if (weatherCondition && weatherAppropriate.some(item => items.includes(item))) {
          confidence += 0.2;
        }

        // Boost confidence for occasion-appropriate items
        if (occasion) {
          confidence += 0.1;
        }

        confidence = Math.min(1.0, confidence);

        recommendations.push({
          items,
          confidence,
          reasoning: this.generateReasoning(mood, weatherCondition, occasion),
          mood,
          weather_condition: weatherCondition,
        });
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get colors associated with a mood
   */
  private static getMoodColors(mood: string): string[] {
    const moodColorMap: Record<string, string[]> = {
      happy: ['yellow', 'orange', 'bright', 'colorful', 'vibrant'],
      confident: ['red', 'black', 'bold', 'strong', 'navy'],
      relaxed: ['blue', 'green', 'soft', 'neutral', 'beige'],
      professional: ['navy', 'black', 'grey', 'white', 'charcoal'],
      creative: ['purple', 'pink', 'unique', 'artistic', 'multicolor'],
      elegant: ['black', 'white', 'gold', 'silver', 'cream'],
      casual: ['denim', 'comfortable', 'everyday', 'khaki'],
      romantic: ['pink', 'red', 'soft', 'feminine', 'rose'],
      energetic: ['bright', 'neon', 'bold', 'electric'],
      calm: ['pastel', 'light', 'muted', 'sage']
    };

    return moodColorMap[mood.toLowerCase()] || [];
  }

  /**
   * Get weather-appropriate items
   */
  private static getWeatherAppropriateItems(items: WardrobeItem[], weatherCondition?: string): WardrobeItem[] {
    if (!weatherCondition) return items;

    // Simple weather logic based on tags and item types
    const weatherPreferences: Record<string, { colors: string[], types: string[], tags: string[] }> = {
      sunny: {
        colors: ['light', 'white', 'yellow', 'bright'],
        types: ['tops'],
        tags: ['light', 'breathable', 'summer', 'cotton']
      },
      rainy: {
        colors: ['dark', 'waterproof'],
        types: ['shoes'],
        tags: ['waterproof', 'jacket', 'boots', 'covered']
      },
      cold: {
        colors: ['dark', 'warm'],
        types: ['tops'],
        tags: ['warm', 'jacket', 'sweater', 'boots', 'long-sleeve']
      },
      cloudy: {
        colors: ['neutral', 'versatile'],
        types: ['tops', 'bottoms'],
        tags: ['versatile', 'layering', 'medium-weight']
      }
    };

    const preferences = weatherPreferences[weatherCondition.toLowerCase()];
    if (!preferences) return items;

    return items.filter(item => {
      // Check if item color matches weather preference
      const colorMatch = !item.color || preferences.colors.some(color => 
        item.color?.toLowerCase().includes(color)
      );
      
      // Check if item tags match weather preference
      const tagMatch = !item.tags || item.tags.some(tag => 
        preferences.tags.some(weatherTag => 
          tag.toLowerCase().includes(weatherTag)
        )
      );
      
      return colorMatch || tagMatch;
    });
  }

  /**
   * Generate reasoning for recommendations
   */
  private static generateReasoning(mood: string, weatherCondition?: string, occasion?: string): string {
    let reasoning = `This outfit is perfect for your ${mood} mood`;
    
    if (weatherCondition) {
      const weatherDescriptions: Record<string, string> = {
        sunny: 'bright and sunny',
        rainy: 'wet and rainy',
        cold: 'cold and chilly',
        cloudy: 'overcast'
      };
      reasoning += ` and is ideal for ${weatherDescriptions[weatherCondition.toLowerCase()] || weatherCondition} weather`;
    }
    
    if (occasion) {
      reasoning += ` for your ${occasion} occasion`;
    }
    
    reasoning += '. The color combination and style choices reflect your desired vibe.';
    return reasoning;
  }

  /**
   * Get mood suggestions based on time of day and weather
   */
  static getMoodSuggestions(weatherCondition?: string, timeOfDay?: string): string[] {
    const baseMoods = ['happy', 'confident', 'relaxed', 'professional', 'casual'];
    
    if (weatherCondition === 'sunny') {
      return ['happy', 'energetic', 'confident', 'casual'];
    } else if (weatherCondition === 'rainy') {
      return ['calm', 'relaxed', 'professional', 'cozy'];
    } else if (weatherCondition === 'cold') {
      return ['cozy', 'warm', 'comfortable', 'elegant'];
    }
    
    if (timeOfDay === 'morning') {
      return ['energetic', 'professional', 'confident', 'fresh'];
    } else if (timeOfDay === 'evening') {
      return ['elegant', 'romantic', 'relaxed', 'sophisticated'];
    }
    
    return baseMoods;
  }

  /**
   * Get color palette suggestions for a mood
   */
  static getColorPalette(mood: string): string[] {
    const moodPalettes: Record<string, string[]> = {
      happy: ['#FFD700', '#FFA500', '#FF6347', '#98FB98'],
      confident: ['#000000', '#DC143C', '#4169E1', '#708090'],
      relaxed: ['#87CEEB', '#98FB98', '#F5F5DC', '#D3D3D3'],
      professional: ['#2F4F4F', '#000000', '#FFFFFF', '#708090'],
      creative: ['#800080', '#FF1493', '#00CED1', '#FFD700'],
      elegant: ['#000000', '#FFFFFF', '#C0C0C0', '#F5F5DC'],
      romantic: ['#FF69B4', '#DC143C', '#FFB6C1', '#F0F8FF'],
      energetic: ['#FF4500', '#32CD32', '#FF1493', '#00BFFF']
    };

    return moodPalettes[mood.toLowerCase()] || ['#000000', '#FFFFFF', '#808080'];
  }
}