// Export all backend services
export * from './auth';
export * from './wardrobe';
export * from './recommendations';
export * from './weather';
export * from './profile';

// Re-export commonly used types
export type {
  WardrobeItem,
  CreateWardrobeItemData,
  UpdateWardrobeItemData,
  WardrobeFilters,
  WardrobeStats,
} from './wardrobe';

export type {
  OutfitRecommendation,
} from './recommendations';

export type {
  UserProfile,
  StylePreferences,
  WeatherPreferences,
} from './profile';

export type {
  SignUpData,
  SignInData,
} from './auth';