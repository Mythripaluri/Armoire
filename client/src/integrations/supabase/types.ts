export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      wardrobe_items: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          color: string
          brand: string | null
          size: string | null
          season: string | null
          occasion: string | null
          tags: string[] | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          color: string
          brand?: string | null
          size?: string | null
          season?: string | null
          occasion?: string | null
          tags?: string[] | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          color?: string
          brand?: string | null
          size?: string | null
          season?: string | null
          occasion?: string | null
          tags?: string[] | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          style_preferences: Json | null
          weather_preferences: Json | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          style_preferences?: Json | null
          weather_preferences?: Json | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          style_preferences?: Json | null
          weather_preferences?: Json | null
        }
      }
      outfits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          item_ids: string[]
          weather_condition: string | null
          mood: string | null
          occasion: string | null
          rating: number | null
          worn_count: number
          last_worn: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          item_ids: string[]
          weather_condition?: string | null
          mood?: string | null
          occasion?: string | null
          rating?: number | null
          worn_count?: number
          last_worn?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          item_ids?: string[]
          weather_condition?: string | null
          mood?: string | null
          occasion?: string | null
          rating?: number | null
          worn_count?: number
          last_worn?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      style_preferences: {
        Row: {
          id: string
          user_id: string
          color_palette: string[] | null
          style_keywords: string[] | null
          preferred_brands: string[] | null
          body_type: string | null
          style_goals: string[] | null
          budget_range: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          color_palette?: string[] | null
          style_keywords?: string[] | null
          preferred_brands?: string[] | null
          body_type?: string | null
          style_goals?: string[] | null
          budget_range?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          color_palette?: string[] | null
          style_keywords?: string[] | null
          preferred_brands?: string[] | null
          body_type?: string | null
          style_goals?: string[] | null
          budget_range?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mood_suggestions: {
        Row: {
          id: string
          user_id: string
          mood: string
          suggested_items: string[]
          suggested_outfits: string[]
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: string
          suggested_items: string[]
          suggested_outfits: string[]
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: string
          suggested_items?: string[]
          suggested_outfits?: string[]
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}