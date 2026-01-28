# Style Mood Fit - Backend Services

This document outlines the backend architecture and services for the Style Mood Fit application.

## Overview

The backend is built using Supabase as the primary database and authentication provider, with TypeScript service classes providing a clean API layer for the frontend.

## Services

### 1. Authentication Service (`auth.ts`)

Handles user authentication and profile management.

**Key Features:**
- User registration and login
- Session management  
- Password reset functionality
- Profile management

**Usage:**
```typescript
import { AuthService } from '@/services/auth';

// Sign up
const { data, error } = await AuthService.signUp({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});

// Sign in
const { data, error } = await AuthService.signIn({
  email: 'user@example.com',
  password: 'password123'
});
```

### 2. Wardrobe Service (`wardrobe.ts`)

Manages user's clothing items and wardrobe organization.

**Key Features:**
- CRUD operations for wardrobe items
- Image upload for clothing items
- Filtering and searching
- Wardrobe statistics

**Usage:**
```typescript
import { WardrobeService } from '@/services/wardrobe';

// Get all items
const { items, error } = await WardrobeService.getUserWardrobeItems(userId);

// Create new item
const { item, error } = await WardrobeService.createWardrobeItem(userId, {
  name: 'Blue Jeans',
  type: 'bottoms',
  color: 'blue',
  tags: ['casual', 'denim']
});
```

### 3. Recommendation Service (`recommendations.ts`)

Provides AI-driven outfit recommendations based on mood, weather, and user preferences.

**Key Features:**
- Mood-based outfit generation
- Weather-appropriate suggestions
- Confidence scoring
- Color palette recommendations

**Usage:**
```typescript
import { RecommendationService } from '@/services/recommendations';

// Generate recommendations
const { recommendations, error } = await RecommendationService.generateRecommendations(
  userId,
  'confident',
  'sunny',
  'professional'
);
```

### 4. Weather Service (`weather.ts`)

Integrates with weather APIs to provide location-based weather data and outfit suggestions.

**Key Features:**
- Current weather data
- Location-based forecasts
- Weather-appropriate outfit suggestions
- Geolocation support

**Usage:**
```typescript
import { WeatherService } from '@/services/weather';

// Get current location weather
const weather = await WeatherService.getCurrentLocationWeather();

// Get outfit suggestions for weather
const suggestions = WeatherService.getWeatherOutfitSuggestions(weather);
```

### 5. Profile Service (`profile.ts`)

Manages user profiles and style preferences.

**Key Features:**
- Style preference management
- Body type recommendations
- Color palette suggestions
- Lifestyle-based recommendations

**Usage:**
```typescript
import { ProfileService } from '@/services/profile';

// Get user profile
const { profile, error } = await ProfileService.getProfile(userId);

// Update style preferences
const { success, error } = await ProfileService.updateStylePreferences(userId, {
  favorite_colors: ['black', 'white', 'blue'],
  style_types: ['professional', 'elegant']
});
```

## Database Schema

### Current Tables

1. **profiles** - User profile information
   - `id`, `user_id`, `email`, `style_preference`
   - Basic user data and style preferences

2. **wardrobe_items** - User's clothing items
   - `id`, `user_id`, `name`, `type`, `color`, `tags`, `image_url`
   - Complete wardrobe item information

### Enhanced Schema (Available via Migration)

The `enhance_schema.sql` migration adds additional tables for:

- **outfits** - Saved outfit combinations
- **outfit_items** - Junction table for outfit-wardrobe relationships
- **style_preferences** - Detailed user style preferences
- **mood_suggestions** - AI-driven outfit suggestions
- **weather_preferences** - User weather preferences

## Environment Variables

To enable full functionality, add these environment variables:

```env
# OpenWeather API (optional - falls back to mock data)
VITE_OPENWEATHER_API_KEY=your_api_key_here

# Supabase (already configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## API Integration

### OpenWeather API

For real weather data, sign up at [OpenWeatherMap](https://openweathermap.org/api) and add your API key to the environment variables.

### Future Integrations

The architecture supports easy integration with:
- Fashion APIs (for style trends)
- Shopping APIs (for price comparisons)
- Social media APIs (for style inspiration)
- Machine learning services (for better recommendations)

## Security

- Row Level Security (RLS) enabled on all tables
- User data isolation through policies
- Secure image storage with Supabase Storage
- Environment variable protection for API keys

## Error Handling

All services include comprehensive error handling:
- Graceful fallbacks for API failures
- Detailed error logging
- User-friendly error messages
- Offline mode support where possible

## Testing

The services are designed to be easily testable:
- Mock data fallbacks
- Dependency injection ready
- Clear separation of concerns
- Type-safe interfaces

## Performance

- Efficient database queries with proper indexing
- Image optimization for wardrobe photos  
- Caching strategies for weather data
- Pagination for large datasets

## Future Enhancements

Planned improvements include:
- Machine learning-based style recommendations
- Social features (sharing outfits, following others)
- Shopping integration
- Calendar-based outfit planning
- Outfit history and analytics
- Mobile app synchronization