import { supabase } from '../integrations/supabase/client';

export interface WardrobeItem {
  id: string;
  user_id: string;
  name: string;
  type: 'tops' | 'bottoms' | 'shoes' | 'accessories';
  color: string | null;
  tags: string[] | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWardrobeItemData {
  name: string;
  type: 'tops' | 'bottoms' | 'shoes' | 'accessories';
  color?: string;
  tags?: string[];
}

export interface UpdateWardrobeItemData {
  name?: string;
  type?: 'tops' | 'bottoms' | 'shoes' | 'accessories';
  color?: string;
  tags?: string[];
}

export interface WardrobeFilters {
  type?: 'tops' | 'bottoms' | 'shoes' | 'accessories';
  color?: string;
  tags?: string[];
  search?: string;
}

export interface WardrobeStats {
  totalItems: number;
  byType: {
    tops: number;
    bottoms: number;
    shoes: number;
    accessories: number;
  };
}

/**
 * Wardrobe Service
 * Handles all wardrobe item management operations
 */
export class WardrobeService {
  /**
   * Get all wardrobe items for a user
   */
  static async getUserWardrobeItems(userId: string, filters?: WardrobeFilters): Promise<{ items: WardrobeItem[]; error: Error | null }> {
    try {
      let query = supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.color) {
        query = query.eq('color', filters.color);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { items: (data as WardrobeItem[]) || [], error: null };
    } catch (error) {
      console.error('Get wardrobe items error:', error);
      return { items: [], error: error as Error };
    }
  }

  /**
   * Get a single wardrobe item by ID
   */
  static async getWardrobeItem(itemId: string): Promise<{ item: WardrobeItem | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      return { item: data as WardrobeItem, error: null };
    } catch (error) {
      console.error('Get wardrobe item error:', error);
      return { item: null, error: error as Error };
    }
  }

  /**
   * Create a new wardrobe item
   */
  static async createWardrobeItem(userId: string, itemData: CreateWardrobeItemData): Promise<{ item: WardrobeItem | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .insert({
          user_id: userId,
          ...itemData,
        })
        .select()
        .single();

      if (error) throw error;
      return { item: data as WardrobeItem, error: null };
    } catch (error) {
      console.error('Create wardrobe item error:', error);
      return { item: null, error: error as Error };
    }
  }

  /**
   * Update a wardrobe item
   */
  static async updateWardrobeItem(itemId: string, updates: UpdateWardrobeItemData): Promise<{ item: WardrobeItem | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return { item: data as WardrobeItem, error: null };
    } catch (error) {
      console.error('Update wardrobe item error:', error);
      return { item: null, error: error as Error };
    }
  }

  /**
   * Delete a wardrobe item
   */
  static async deleteWardrobeItem(itemId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('wardrobe_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Delete wardrobe item error:', error);
      return { error: error as Error };
    }
  }

  /**
   * Upload an image for a wardrobe item
   */
  static async uploadWardrobeImage(file: File, userId: string, itemId?: string): Promise<{ url: string | null; error: Error | null }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${itemId || Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('wardrobe')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('wardrobe')
        .getPublicUrl(fileName);

      return { url: data.publicUrl, error: null };
    } catch (error) {
      console.error('Upload wardrobe image error:', error);
      return { url: null, error: error as Error };
    }
  }

  /**
   * Delete an image from wardrobe storage
   */
  static async deleteWardrobeImage(imageUrl: string): Promise<{ error: Error | null }> {
    try {
      const fileName = imageUrl.split('/').pop();
      if (!fileName) throw new Error('Invalid image URL');

      const { error } = await supabase.storage
        .from('wardrobe')
        .remove([fileName]);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Delete wardrobe image error:', error);
      return { error: error as Error };
    }
  }

  /**
   * Get wardrobe statistics
   */
  static async getWardrobeStats(userId: string): Promise<{ stats: WardrobeStats | null; error: Error | null }> {
    try {
      const { data: items, error } = await supabase
        .from('wardrobe_items')
        .select('type')
        .eq('user_id', userId);

      if (error) throw error;

      const stats: WardrobeStats = {
        totalItems: items?.length || 0,
        byType: {
          tops: items?.filter(item => item.type === 'tops').length || 0,
          bottoms: items?.filter(item => item.type === 'bottoms').length || 0,
          shoes: items?.filter(item => item.type === 'shoes').length || 0,
          accessories: items?.filter(item => item.type === 'accessories').length || 0,
        },
      };

      return { stats, error: null };
    } catch (error) {
      console.error('Get wardrobe stats error:', error);
      return { stats: null, error: error as Error };
    }
  }

  /**
   * Get items by category
   */
  static async getItemsByCategory(userId: string, category: string): Promise<{ items: WardrobeItem[]; error: Error | null }> {
    return this.getUserWardrobeItems(userId, { type: category as 'tops' | 'bottoms' | 'shoes' | 'accessories' });
  }

  /**
   * Search wardrobe items
   */
  static async searchWardrobeItems(userId: string, searchTerm: string): Promise<{ items: WardrobeItem[]; error: Error | null }> {
    return this.getUserWardrobeItems(userId, { search: searchTerm });
  }
}