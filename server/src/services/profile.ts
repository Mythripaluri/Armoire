import { supabase } from '../integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  style_preference: string | null;
  created_at: string;
  updated_at: string;
}

export interface StylePreferences {
  favorite_colors: string[];
  style_types: string[];
  body_type: string | null;
  preferred_fit: string;
  budget_range: string;
  lifestyle: string;
}

export interface WeatherPreferences {
  preferred_temperature_unit: string;
  location_name: string | null;
  auto_weather_suggestions: boolean;
}

/**
 * Profile and Preferences Service
 * Handles user profile and style preference management
 */
export class ProfileService {
  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { profile: data as UserProfile, error: null };
    } catch (error) {
      console.error('Get profile error:', error);
      return { profile: null, error: error as Error };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string, 
    updates: Partial<Pick<UserProfile, 'email' | 'style_preference'>>
  ): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { profile: data as UserProfile, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { profile: null, error: error as Error };
    }
  }

  /**
   * Get user's style preferences (when enhanced schema is available)
   */
  static async getStylePreferences(userId: string): Promise<{ preferences: StylePreferences | null; error: Error | null }> {
    // For now, return mock data based on current profile
    try {
      const { profile, error } = await this.getProfile(userId);
      
      if (error || !profile) {
        return { preferences: null, error };
      }

      // Create mock preferences based on style_preference
      const mockPreferences: StylePreferences = {
        favorite_colors: this.getColorsForStyle(profile.style_preference || 'casual'),
        style_types: [profile.style_preference || 'casual'],
        body_type: null,
        preferred_fit: 'regular',
        budget_range: 'medium',
        lifestyle: profile.style_preference || 'casual',
      };

      return { preferences: mockPreferences, error: null };
    } catch (error) {
      console.error('Get style preferences error:', error);
      return { preferences: null, error: error as Error };
    }
  }

  /**
   * Update style preferences
   */
  static async updateStylePreferences(
    userId: string, 
    preferences: Partial<StylePreferences>
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      // For now, just update the main style preference in the profile
      if (preferences.style_types && preferences.style_types.length > 0) {
        await this.updateProfile(userId, {
          style_preference: preferences.style_types[0]
        });
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Update style preferences error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get weather preferences (mock for now)
   */
  static async getWeatherPreferences(userId: string): Promise<{ preferences: WeatherPreferences | null; error: Error | null }> {
    try {
      // Return default preferences
      const mockPreferences: WeatherPreferences = {
        preferred_temperature_unit: 'celsius',
        location_name: null,
        auto_weather_suggestions: true,
      };

      return { preferences: mockPreferences, error: null };
    } catch (error) {
      console.error('Get weather preferences error:', error);
      return { preferences: null, error: error as Error };
    }
  }

  /**
   * Update weather preferences
   */
  static async updateWeatherPreferences(
    userId: string, 
    preferences: Partial<WeatherPreferences>
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      // For now, just return success
      // In full implementation, this would update the weather_preferences table
      console.log('Weather preferences would be updated:', preferences);
      return { success: true, error: null };
    } catch (error) {
      console.error('Update weather preferences error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get recommended style types
   */
  static getStyleTypes(): string[] {
    return [
      'casual',
      'professional',
      'elegant',
      'sporty',
      'bohemian',
      'minimalist',
      'vintage',
      'trendy',
      'classic',
      'edgy'
    ];
  }

  /**
   * Get body types
   */
  static getBodyTypes(): string[] {
    return [
      'pear',
      'apple',
      'hourglass',
      'rectangle',
      'inverted-triangle',
      'athletic'
    ];
  }

  /**
   * Get fit preferences
   */
  static getFitPreferences(): string[] {
    return [
      'slim',
      'regular',
      'relaxed',
      'oversized'
    ];
  }

  /**
   * Get budget ranges
   */
  static getBudgetRanges(): string[] {
    return [
      'budget',
      'medium',
      'premium',
      'luxury'
    ];
  }

  /**
   * Get lifestyle options
   */
  static getLifestyles(): string[] {
    return [
      'student',
      'professional',
      'parent',
      'creative',
      'active',
      'social',
      'homebody',
      'traveler'
    ];
  }

  /**
   * Get colors associated with a style
   */
  private static getColorsForStyle(style: string): string[] {
    const styleColors: Record<string, string[]> = {
      casual: ['blue', 'grey', 'white', 'khaki'],
      professional: ['navy', 'black', 'white', 'grey'],
      elegant: ['black', 'white', 'gold', 'burgundy'],
      sporty: ['black', 'white', 'red', 'blue'],
      bohemian: ['earth tones', 'brown', 'orange', 'green'],
      minimalist: ['white', 'black', 'grey', 'beige'],
      vintage: ['brown', 'mustard', 'burgundy', 'cream'],
      trendy: ['bright colors', 'pink', 'neon', 'purple'],
      classic: ['navy', 'white', 'black', 'camel'],
      edgy: ['black', 'white', 'red', 'metallic']
    };

    return styleColors[style] || ['black', 'white', 'grey'];
  }

  /**
   * Get style recommendations based on body type
   */
  static getStyleRecommendationsForBodyType(bodyType: string): {
    recommended: string[];
    tips: string[];
  } {
    const recommendations: Record<string, { recommended: string[], tips: string[] }> = {
      pear: {
        recommended: ['A-line tops', 'Wide-leg pants', 'Structured jackets'],
        tips: ['Emphasize your upper body', 'Choose tops with interesting details', 'Avoid tight bottoms']
      },
      apple: {
        recommended: ['Empire waist', 'V-necks', 'Straight-leg pants'],
        tips: ['Create a defined waistline', 'Draw attention to your legs', 'Choose flowing fabrics']
      },
      hourglass: {
        recommended: ['Fitted styles', 'Wrap dresses', 'High-waisted bottoms'],
        tips: ['Highlight your waist', 'Choose fitted silhouettes', 'Avoid boxy shapes']
      },
      rectangle: {
        recommended: ['Peplum tops', 'Belted styles', 'Layered looks'],
        tips: ['Create curves with layering', 'Use belts to define waist', 'Add texture and volume']
      },
      'inverted-triangle': {
        recommended: ['A-line skirts', 'Wide-leg pants', 'Soft fabrics'],
        tips: ['Balance your shoulders', 'Add volume to your lower body', 'Choose soft, flowing fabrics']
      },
      athletic: {
        recommended: ['Fitted styles', 'Structured pieces', 'Feminine details'],
        tips: ['Soften your silhouette', 'Add feminine touches', 'Choose structured pieces']
      }
    };

    return recommendations[bodyType] || {
      recommended: ['Versatile basics', 'Classic fits'],
      tips: ['Choose what makes you feel confident', 'Experiment with different styles']
    };
  }

  /**
   * Get color palette recommendations
   */
  static getColorRecommendations(skinTone?: string, preferences?: string[]): string[] {
    // Simple color recommendations
    const baseColors = ['black', 'white', 'navy', 'grey'];
    
    if (preferences && preferences.length > 0) {
      return [...baseColors, ...preferences];
    }

    // Add seasonal colors
    const seasonalColors = ['burgundy', 'forest green', 'mustard', 'cream'];
    
    return [...baseColors, ...seasonalColors];
  }
}