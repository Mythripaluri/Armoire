/**
 * Server Entry Point
 * 
 * This file serves as the main entry point for the server-side services.
 * In a full-stack setup, this would be where you'd start your Express server,
 * API routes, or other backend services.
 */

import { AuthService } from './services/auth';
import { WardrobeService } from './services/wardrobe';
import { RecommendationService } from './services/recommendations';
import { WeatherService } from './services/weather';
import { ProfileService } from './services/profile';

// Export all services for use by the client
export {
  AuthService,
  WardrobeService,
  RecommendationService,
  WeatherService,
  ProfileService
};

// For development purposes, you can add server startup logic here
console.log('Style Mood Fit Server - Services initialized');

// Example: If you were to add an Express server in the future
// import express from 'express';
// const app = express();
// const PORT = process.env.PORT || 3001;
// 
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });