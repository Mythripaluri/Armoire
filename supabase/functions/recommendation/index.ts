// Supabase Edge Function: Outfit Recommendation API with CORS
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WardrobeItem {
  id: string;
  user_id: string;
  name: string;
  type: "tops" | "bottoms" | "shoes" | "accessories" | "outerwear";
  color?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
  created_at?: string;
}

interface RecommendationRequest {
  userId: string;
  mood?: string;
  weather?: {
    temperature: number;
    condition: string;
  };
}

// Mock wardrobe items for testing
function getMockWardrobeItems(): WardrobeItem[] {
  return [
    {
      id: "1",
      user_id: "test-user",
      name: "White Button-up Shirt",
      type: "tops",
      color: "white",
      tags: ["formal", "professional"],
      image_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      user_id: "test-user",
      name: "Black Dress Pants",
      type: "bottoms",
      color: "black",
      tags: ["formal", "professional"],
      image_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      user_id: "test-user",
      name: "Black Leather Shoes",
      type: "shoes",
      color: "black",
      tags: ["formal", "professional"],
      image_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      user_id: "test-user",
      name: "Blue Jeans",
      type: "bottoms",
      color: "blue",
      tags: ["casual", "denim"],
      image_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "5",
      user_id: "test-user",
      name: "Casual T-Shirt",
      type: "tops",
      color: "gray",
      tags: ["casual", "comfortable"],
      image_url: null,
      created_at: new Date().toISOString(),
    },
  ];
}

// Smart recommendation logic with variety
function generateOutfitRecommendation(items: WardrobeItem[], mood: string = "casual"): WardrobeItem[] {
  // Group items by type
  const tops = items.filter(item => item.type === "tops");
  const bottoms = items.filter(item => item.type === "bottoms");
  const shoes = items.filter(item => item.type === "shoes");
  const accessories = items.filter(item => item.type === "accessories");
  const outerwear = items.filter(item => item.type === "outerwear");

  const recommendation: WardrobeItem[] = [];

  // Mood-based selection with color preferences
  let preferredTags: string[] = [];
  let preferredColors: string[] = [];
  let moodWeight = 1;
  
  switch (mood?.toLowerCase()) {
    case 'confident':
    case 'professional':
      preferredTags = ['formal', 'professional', 'blazer', 'dress', 'business'];
      preferredColors = ['black', 'navy', 'white', 'gray', 'charcoal'];
      moodWeight = 3;
      break;
    case 'casual':
    case 'relaxed':
    case 'chill':
      preferredTags = ['casual', 'comfortable', 'jeans', 't-shirt', 'sneakers'];
      preferredColors = ['blue', 'denim', 'white', 'gray', 'khaki'];
      moodWeight = 2;
      break;
    case 'elegant':
    case 'fancy':
    case 'sophisticated':
      preferredTags = ['elegant', 'dress', 'formal', 'heels', 'classy'];
      preferredColors = ['black', 'navy', 'burgundy', 'cream', 'gold'];
      moodWeight = 3;
      break;
    case 'fun':
    case 'playful':
    case 'creative':
      preferredTags = ['colorful', 'bright', 'pattern', 'fun', 'trendy'];
      preferredColors = ['red', 'pink', 'yellow', 'green', 'purple'];
      moodWeight = 2;
      break;
    case 'romantic':
    case 'date':
      preferredTags = ['dress', 'romantic', 'feminine', 'soft', 'elegant'];
      preferredColors = ['pink', 'red', 'white', 'cream', 'pastel'];
      moodWeight = 2;
      break;
    default:
      preferredTags = ['casual'];
      preferredColors = [];
      moodWeight = 1;
  }

  // Enhanced scoring function
  const scoreItem = (item: WardrobeItem): number => {
    let score = Math.random() * 2; // Add randomness base (0-2)
    
    // Tag matching
    if (item.tags && item.tags.length > 0) {
      for (const tag of item.tags) {
        if (preferredTags.includes(tag?.toLowerCase() || '')) {
          score += moodWeight;
        }
      }
    }
    
    // Color matching
    if (item.color && preferredColors.includes(item.color.toLowerCase())) {
      score += moodWeight * 0.5;
    }
    
    // Boost score for items with any tags (more detailed items)
    if (item.tags && item.tags.length > 0) {
      score += 0.5;
    }
    
    return score;
  };

  // Helper function to pick from top scoring items with variety
  const pickItemWithVariety = (itemList: WardrobeItem[], count: number = 1): WardrobeItem[] => {
    if (itemList.length === 0) return [];
    
    // Score all items
    const scoredItems = itemList.map(item => ({
      item,
      score: scoreItem(item)
    }));
    
    // Sort by score
    scoredItems.sort((a, b) => b.score - a.score);
    
    // Pick from top 3 items (or all if less than 3) to add variety
    const topItems = scoredItems.slice(0, Math.min(3, scoredItems.length));
    const selectedItems: WardrobeItem[] = [];
    
    for (let i = 0; i < count && topItems.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * topItems.length);
      selectedItems.push(topItems[randomIndex].item);
      topItems.splice(randomIndex, 1); // Remove selected item
    }
    
    return selectedItems;
  };

  // Pick items with variety
  recommendation.push(...pickItemWithVariety(tops, 1));
  recommendation.push(...pickItemWithVariety(bottoms, 1));
  recommendation.push(...pickItemWithVariety(shoes, 1));
  
  // Add outerwear for certain moods with probability
  if (outerwear.length > 0) {
    const shouldAddOuterwear = ['confident', 'professional', 'elegant'].includes(mood?.toLowerCase() || '') 
      ? Math.random() > 0.3  // 70% chance for formal moods
      : Math.random() > 0.7; // 30% chance for other moods
      
    if (shouldAddOuterwear) {
      recommendation.push(...pickItemWithVariety(outerwear, 1));
    }
  }
  
  // Add accessories with mood-based probability
  if (accessories.length > 0) {
    const accessoryChance = mood?.toLowerCase() === 'elegant' || mood?.toLowerCase() === 'fancy' 
      ? 0.8  // 80% chance for elegant moods
      : mood?.toLowerCase() === 'professional' || mood?.toLowerCase() === 'confident'
      ? 0.6  // 60% chance for professional moods
      : 0.4; // 40% chance for other moods
      
    if (Math.random() < accessoryChance) {
      recommendation.push(...pickItemWithVariety(accessories, 1));
    }
  }

  return recommendation;
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
    // Get the authorization header to authenticate the request
    const authHeader = req.headers.get('Authorization')
    
    // Initialize Supabase client with user authentication
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://mfsjbqwnxodmtyhizwpn.supabase.co'
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mc2picXdueG9kbXR5aGl6d3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njk0ODksImV4cCI6MjA3MzM0NTQ4OX0.-NduhSST-AuDR0YeKtBLG_6YoHyP3Jr9GuKTfi3EZXs'
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {}
      }
    })

    let body: RecommendationRequest;
    
    if (req.method === 'POST') {
      body = await req.json();
    } else {
      // Default request for GET
      body = { userId: 'test-user', mood: 'casual' };
    }

    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('No authenticated user found, using mock data');
      // Fallback to mock data if not authenticated
      const wardrobeItems = getMockWardrobeItems();
      const recommendation = generateOutfitRecommendation(wardrobeItems, body.mood);
      
      return new Response(JSON.stringify({
        recommendations: [{
          id: "rec-demo",
          items: recommendation,
          confidence: 0.5,
          mood: body.mood,
          totalItems: wardrobeItems.length,
          created_at: new Date().toISOString(),
          note: "Demo data - please log in to use your wardrobe"
        }]
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching wardrobe items for authenticated user:', user.id);

    // Fetch real wardrobe items from database using authenticated user ID
    const { data: wardrobeItems, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', user.id);

    console.log('Database query result:', { wardrobeItems, error });

    if (error) {
      console.error('Database error:', error);
      // Fallback to mock data if database fails
      const wardrobeItems = getMockWardrobeItems();
      const recommendation = generateOutfitRecommendation(wardrobeItems, body.mood);
      
      return new Response(JSON.stringify({
        recommendations: [{
          id: "rec-fallback",
          items: recommendation,
          confidence: 0.5,
          mood: body.mood,
          totalItems: wardrobeItems.length,
          created_at: new Date().toISOString(),
          note: `Using demo data - database error: ${error.message}`
        }]
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found wardrobe items:', wardrobeItems?.length || 0);

    // If no items found, return empty recommendation with helpful message
    if (!wardrobeItems || wardrobeItems.length === 0) {
      return new Response(JSON.stringify({
        recommendations: [],
        message: 'No wardrobe items found. Please add some items to your wardrobe first.',
        totalItems: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate recommendation from real items
    const recommendation = generateOutfitRecommendation(wardrobeItems, body.mood);

    const response = {
      recommendations: [
        {
          id: "rec-1",
          items: recommendation,
          confidence: recommendation.length > 2 ? 0.85 : 0.65,
          mood: body.mood,
          totalItems: wardrobeItems.length,
          created_at: new Date().toISOString(),
          note: "Generated from your wardrobe"
        }
      ]
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate recommendation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});