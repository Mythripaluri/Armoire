# Style Mood Fit

A personalized fashion and outfit recommendation application built with React, TypeScript, and Supabase.

## Project Structure

This project has been organized into a client-server architecture:

```
style-mood-fit/
├── client/          # Frontend React application
│   ├── src/
│   │   ├── api/             # API bridge layer
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Application pages
│   │   └── lib/             # Utilities
│   ├── package.json         # Client dependencies
│   └── vite.config.ts       # Vite configuration
├── server/          # Backend services
│   ├── src/
│   │   ├── services/        # Business logic services
│   │   ├── integrations/    # Supabase integration
│   │   └── types/           # TypeScript types
│   └── package.json         # Server dependencies
└── supabase/        # Database migrations and config
```

## Features

- User authentication and profiles
- Wardrobe management
- Weather-based outfit recommendations
- Mood-based styling suggestions
- Style preference tracking

## Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: TypeScript services, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Row Level Security
- **Weather API**: OpenWeatherMap integration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd style-mood-fit
   ```

2. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

3. Install server dependencies:
   ```bash
   cd ../server
   npm install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in both client and server directories
   - Add your Supabase URL and keys
   - Add your OpenWeatherMap API key

### Running the Application

1. Start the client development server:
   ```bash
   cd client
   npm run dev
   ```

2. The application will be available at `http://localhost:8080`

### Database Setup

1. Run the Supabase migrations:
   ```bash
   cd supabase
   supabase db push
   ```

## Backend Services

The application includes comprehensive backend services:

- **AuthService**: User authentication and session management
- **WardrobeService**: Wardrobe item management and categorization
- **RecommendationService**: AI-powered outfit recommendations
- **WeatherService**: Weather data integration for recommendations
- **ProfileService**: User profile and preference management

## API Integration

The client communicates with backend services through a clean API bridge layer located in `client/src/api/index.ts`. This provides a unified interface for all backend operations.

## Development

- Run ESLint: `npm run lint`
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## Contributing

1. Follow the established project structure
2. Maintain separation between client and server code
3. Use TypeScript for type safety
4. Follow the existing code style and patterns
