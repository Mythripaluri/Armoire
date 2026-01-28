-- Enhanced schema for Style Mood Fit application

-- Create outfits table for saved outfit combinations
CREATE TABLE public.outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  mood_tags TEXT[],
  weather_condition TEXT,
  occasion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outfit_items junction table for outfit-wardrobe item relationships
CREATE TABLE public.outfit_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  wardrobe_item_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(outfit_id, wardrobe_item_id)
);

-- Create style_preferences table for detailed user preferences
CREATE TABLE public.style_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_colors TEXT[],
  style_types TEXT[] DEFAULT ARRAY['casual'],
  body_type TEXT,
  preferred_fit TEXT DEFAULT 'regular',
  budget_range TEXT DEFAULT 'medium',
  lifestyle TEXT DEFAULT 'casual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mood_suggestions table for AI-driven outfit suggestions
CREATE TABLE public.mood_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  suggested_outfit_id UUID REFERENCES public.outfits(id),
  weather_condition TEXT,
  confidence_score FLOAT DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weather_preferences table
CREATE TABLE public.weather_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_temperature_unit TEXT DEFAULT 'celsius',
  location_name TEXT,
  auto_weather_suggestions BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for outfits
CREATE POLICY "Users can view their own outfits" 
ON public.outfits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outfits" 
ON public.outfits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits" 
ON public.outfits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfits" 
ON public.outfits 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for outfit_items
CREATE POLICY "Users can view their own outfit items" 
ON public.outfit_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.outfits 
  WHERE public.outfits.id = outfit_id 
  AND public.outfits.user_id = auth.uid()
));

CREATE POLICY "Users can create their own outfit items" 
ON public.outfit_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.outfits 
  WHERE public.outfits.id = outfit_id 
  AND public.outfits.user_id = auth.uid()
));

CREATE POLICY "Users can update their own outfit items" 
ON public.outfit_items 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.outfits 
  WHERE public.outfits.id = outfit_id 
  AND public.outfits.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own outfit items" 
ON public.outfit_items 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.outfits 
  WHERE public.outfits.id = outfit_id 
  AND public.outfits.user_id = auth.uid()
));

-- Create policies for style_preferences
CREATE POLICY "Users can view their own style preferences" 
ON public.style_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own style preferences" 
ON public.style_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own style preferences" 
ON public.style_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for mood_suggestions
CREATE POLICY "Users can view their own mood suggestions" 
ON public.mood_suggestions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood suggestions" 
ON public.mood_suggestions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for weather_preferences
CREATE POLICY "Users can view their own weather preferences" 
ON public.weather_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weather preferences" 
ON public.weather_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weather preferences" 
ON public.weather_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for timestamp updates
CREATE TRIGGER update_outfits_updated_at
  BEFORE UPDATE ON public.outfits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_style_preferences_updated_at
  BEFORE UPDATE ON public.style_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weather_preferences_updated_at
  BEFORE UPDATE ON public.weather_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to create additional records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Create default style preferences
  INSERT INTO public.style_preferences (user_id)
  VALUES (NEW.id);
  
  -- Create default weather preferences
  INSERT INTO public.weather_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add size and fit information to wardrobe_items
ALTER TABLE public.wardrobe_items 
ADD COLUMN size TEXT,
ADD COLUMN fit_type TEXT DEFAULT 'regular',
ADD COLUMN brand TEXT,
ADD COLUMN price DECIMAL(10,2),
ADD COLUMN purchase_date DATE,
ADD COLUMN last_worn DATE,
ADD COLUMN wear_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX idx_wardrobe_items_user_id ON public.wardrobe_items(user_id);
CREATE INDEX idx_wardrobe_items_type ON public.wardrobe_items(type);
CREATE INDEX idx_outfits_user_id ON public.outfits(user_id);
CREATE INDEX idx_outfit_items_outfit_id ON public.outfit_items(outfit_id);
CREATE INDEX idx_mood_suggestions_user_id ON public.mood_suggestions(user_id);